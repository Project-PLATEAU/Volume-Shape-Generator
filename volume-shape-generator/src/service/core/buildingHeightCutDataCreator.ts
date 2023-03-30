import * as BABYLON from '@babylonjs/core'
import ExtrudePolygonMeshCreator from '../utils/extrudePolygonMeshCreator'
import SurfaceAreaCalc from '../utils/surfaceAreaCalc'
import BooleanOperator from '../utils/booleanOperator'


/*** 条件に沿った高さで建物形状をカット */
class BuildingHeightCutDataCreator {

  private booleanOperator = new BooleanOperator()
  private surfaceAreaCalc = new SurfaceAreaCalc()

  //フロア面積計算から算出した高さでカットしたMeshを返す
  getHeightCutResultData = (scene: BABYLON.Scene, resultMesh: BABYLON.Mesh, depth: number, siteArea: number, far: number, kaidaka: number) => {

    const {floorAreas, areaNode} = this.floorStack(scene, resultMesh, depth, siteArea, far, kaidaka)
    const cutResultMesh: BABYLON.Mesh = this.cutCalculatedHeight(scene, floorAreas.length * kaidaka, resultMesh)
    areaNode.parent = cutResultMesh
    return cutResultMesh
  }

  /*** 各フロア面積合計/敷地面積 <= 容積率（定数) の計算からカットすべき高さを算出 */
  private floorStack = (scene: BABYLON.Scene, resultMesh: BABYLON.Mesh, depth: number,
                        siteArea: number, far: number, kaidaka: number) => {

    //far=容積率 | kaidaka=階高 | siteArea=敷地面積
    //各フロア面積合計/敷地面積 <= 容積率（定数)

    const areaNode: BABYLON.TransformNode = new BABYLON.TransformNode("BaseNode2", scene)
    let loopCount = 0
    let totalFloorArea = 0
    let floorAreas: number[] = []
    let floorMeshes: BABYLON.Mesh[] = []

    while (true) {
      const targetAreaHeight = loopCount * kaidaka
      const topAreaParam = this.floorAreaCalc(scene, resultMesh, targetAreaHeight, depth)

      //面積0の場合は終了
      if (topAreaParam.areaVol === 0) {
        topAreaParam.areaMesh.dispose()
        //面積0の結果になった場合、floorAreasのlastIndexは屋根の面積のなるため、引いた値がトータルフロア面積
        totalFloorArea = totalFloorArea - floorAreas[floorAreas.length - 1]
        //屋根のareaを削除
        floorAreas.pop()
        floorMeshes[floorMeshes.length - 1].dispose()
        floorMeshes.pop()
        break
      }

      //各フロア面積合計/敷地面積 <= 容積率（定数）を越えたら終了
      if ((totalFloorArea + topAreaParam.areaVol) / siteArea > far * 0.01) {
        topAreaParam.areaMesh.dispose()
        break
      }

      //視覚的確認用フロアMeshをNodeに格納
      topAreaParam.areaMesh.parent = areaNode
      floorMeshes.push(topAreaParam.areaMesh)
      //算出したフロア面積をトータルフロア面積に加える
      totalFloorArea = totalFloorArea + topAreaParam.areaVol
      //各フロア面積を確認できるように配列に格納
      floorAreas.push(topAreaParam.areaVol)
      loopCount++
    }

    areaNode.position = new BABYLON.Vector3(0, -depth, 0)
    areaNode.scaling = new BABYLON.Vector3(1, 1, 1)

    return {floorAreas, areaNode}
  }

  /*** 算出した高さでカットする */
  private cutCalculatedHeight = (scene: BABYLON.Scene, cutHeight: number, resultMesh: BABYLON.Mesh) => {

    const topCutWid = 150

    const topCutPoints: BABYLON.Vector3[] = [
      new BABYLON.Vector3(topCutWid, 0, -topCutWid),
      new BABYLON.Vector3(topCutWid, 0, topCutWid),
      new BABYLON.Vector3(-topCutWid, 0, topCutWid),
      new BABYLON.Vector3(-topCutWid, 0, -topCutWid),
    ]

    const topCutDepth = 200
    const topCutMesh = new ExtrudePolygonMeshCreator().createExtrude(scene, topCutPoints, topCutDepth)

    topCutMesh.position = new BABYLON.Vector3(0, topCutDepth + cutHeight, 0)

    const heightCutMesh = this.booleanOperator.createSubtract(scene, resultMesh, topCutMesh)
    heightCutMesh.scaling = new BABYLON.Vector3(1, 1, 1)
    heightCutMesh.isVisible = true

    resultMesh.isVisible = false
    topCutMesh.isVisible = false
    topCutMesh.dispose()
    resultMesh.dispose()

    topCutMesh.parent = heightCutMesh

    return heightCutMesh
  }

  private floorAreaCalc = (scene: BABYLON.Scene, resultMesh: BABYLON.Mesh, floorHeight: number, depth: number) => {

    const sliceMesh: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("sliceMesh", {
      size: 1,
      updatable: true
    }, scene)

    sliceMesh.scaling = new BABYLON.Vector3(250, 0.000012, 250)
    sliceMesh.position = new BABYLON.Vector3(0, -depth + 1.000001, 0)
    let ground = 0

    if (floorHeight <= 0.001) {
      ground = 0.00001
    } else if (floorHeight >= depth) {
      ground = -0.00001
    }

    sliceMesh.position = new BABYLON.Vector3(0, ground + floorHeight, 0)

    const areaMesh = this.booleanOperator.createIntersect(scene, resultMesh, sliceMesh)
    const area = this.surfaceAreaCalc.surfaceArea(areaMesh, true)
    return {areaVol: area, areaMesh: areaMesh}
  }
}

export default BuildingHeightCutDataCreator
