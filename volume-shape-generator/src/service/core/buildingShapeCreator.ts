import * as BABYLON from '@babylonjs/core'
import {Scene} from '@babylonjs/core'
import ExtrudePolygonMeshCreator from '../utils/extrudePolygonMeshCreator'
import BooleanOperator from '../utils/booleanOperator'
import CuttingPlaneMeshCreator from './cuttingPlaneMeshCreator'
import BuildingHeightCutDataCreator from './buildingHeightCutDataCreator'
import BuildingParam from './buildingParam'
import CartesianToVectorConverter from '../utils/cartesianToVectorConverter'
import "@babylonjs/loaders/glTF"


/*** 道路斜線や隣地斜線、階高や容積率に基づいた建物形状のカットを行う */
class BuildingShapeCreator {

  private cuttingPlaneMeshCreator = new CuttingPlaneMeshCreator()
  private heightCutter = new BuildingHeightCutDataCreator()
  private cartToVecConv = new CartesianToVectorConverter()
  private booleanOperator = new BooleanOperator()

  cutBasedOnRestrictions = (scene: Scene, bldgParam: BuildingParam) => {

    //床面座標配列をBabylon用に変換し取得
    const bldgFootVec3Arr = this.cartToVecConv.convertCartesianToVectors(bldgParam.building)
    //maxLimitH処理から建物メッシュFootからの押し出し量を決定
    const depth = this.getExtrudePolygonMeshDepth(bldgParam.maxLimitH)
    //床面座標配列から押し出しによるMeshを作成
    let buildingMesh = this.createBldgMesh(scene, bldgFootVec3Arr, depth)

    //隣地斜線カット処理
    for (let i = 0; i < bldgParam.rinchPlanes.length; i++) {
      const rinchPlanePoints = this.cartToVecConv.convertCartesianToVectors(bldgParam.rinchPlanes[i])
      const cutMesh = this.cuttingPlaneMeshCreator.createCuttingPlaneMesh(scene, rinchPlanePoints)
      buildingMesh = this.booleanOperator.createSubtract(scene, buildingMesh, cutMesh)
    }

    //道路斜線カット処理
    for (let i = 0; i < bldgParam.syasenPlanes.length; i++) {
      const syasenPlanePoints = this.cartToVecConv.convertCartesianToVectors(bldgParam.syasenPlanes[i])
      const cutMesh = this.cuttingPlaneMeshCreator.createCuttingPlaneMesh(scene, syasenPlanePoints)
      buildingMesh = this.booleanOperator.createSubtract(scene, buildingMesh, cutMesh)
    }

    let [siteArea, far, kaidaka] = [bldgParam.siteArea, bldgParam.far, bldgParam.kaidaka]

    //算出した高さでカットしたメッシュを作成
    const cutResultMesh = this
      .heightCutter.getHeightCutResultData(scene, buildingMesh, depth, siteArea, far, kaidaka)

    //Babylonが北基準に対しCesiumが東基準なので90度の調整
    const node = new BABYLON.TransformNode("CutResultNode", scene)
    cutResultMesh.parent = node
    node.rotation = new BABYLON.Vector3(0, -Math.PI * 0.5, 0)
    const resultMeshName = "ResultMesh"
    cutResultMesh.name = resultMeshName
    return resultMeshName
  }

  /*** maxLimitH処理 */
  private getExtrudePolygonMeshDepth = (limitH: number | null) => {

    if (limitH !== null) {
      return limitH
    } else {
      return 700
    }
  }

  /*** 建物メッシュの作成 */
  private createBldgMesh = (scene: BABYLON.Scene, footVec3Array: BABYLON.Vector3[], depth: number) => {

    //押し出しによるMeshの形成(押し出し量=depth)
    const mainMesh = new ExtrudePolygonMeshCreator().createExtrude(scene, footVec3Array, depth)
    mainMesh.position =
      new BABYLON.Vector3(mainMesh.position.x, mainMesh.position.y + depth, mainMesh.position.z,)
    return mainMesh
  }
}

export default BuildingShapeCreator
