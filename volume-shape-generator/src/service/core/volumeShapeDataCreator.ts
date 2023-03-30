import * as BABYLON from '@babylonjs/core'
import {GLTF2Export, GLTFData} from '@babylonjs/serializers/glTF'
import "@babylonjs/loaders/glTF"
import ExtrudePolygonMeshCreator from '../utils/extrudePolygonMeshCreator'
import BooleanOperator from '../utils/booleanOperator'
import NodeController from '../utils/nodeController'
import SurfaceAreaCalc from '../utils/surfaceAreaCalc'

/*** 容積形状の体積計算とGLBの作成 */
class VolumeShapeDataCreator {

  private objectManager = new NodeController()
  private surfaceAreaCalc = new SurfaceAreaCalc()
  private booleanOperator = new BooleanOperator()

  getGlbAndVolumeValue = async (scene: BABYLON.Scene, cityGmlMe: number, volumeCalcDetailVal: number, filePrefix: string, resultMeshName: string, useShowResult: boolean = false) => {
    const totalGlb: GLTFData = await GLTF2Export.GLBAsync(scene, `${filePrefix}Total`)
    let targetMesh!: BABYLON.Mesh
    targetMesh = this.objectManager.searchNode(scene, resultMeshName) as BABYLON.Mesh
    this.objectManager.disposeRecursive(targetMesh, false)
    const targetMeshNode = new BABYLON.TransformNode("targetMeshNode", scene)
    targetMesh.parent = targetMeshNode

    if (useShowResult) {
      this.objectManager.disposeNodes(scene, ["camera", "light", "targetMeshNode"])
    } else {
      this.objectManager.disposeNodes(scene, ["targetMeshNode"])
    }

    const underProcessMeshName = "underProcessMesh"
    const underProcessNodeName = "underProcessNode"
    const underProcessMesh = targetMesh.clone(underProcessMeshName)
    const underProcessNode = new BABYLON.TransformNode(underProcessNodeName, scene)
    underProcessMesh.parent = underProcessNode
    underProcessMesh.isVisible = false

    //UpperGLBの作成と体積
    //全体の体積の近似値を算出
    const totalVolume = this.getVolumeValue(scene, targetMesh, 0, volumeCalcDetailVal)

    let upperVolume: number = 0
    let underVolume: number = totalVolume
    let upperGlb: GLTFData | undefined

    try {
      targetMesh.parent = null
      targetMeshNode.dispose(false, true)
      //分割（上）のMeshを作成
      const upperMesh = this.cutCalculatedHeight(scene, cityGmlMe, targetMesh, false)
      upperMesh.name = "upperMesh"
      //分割（上）の体積の近似値。citygml_meの値でカットする
      upperVolume = this.getVolumeValue(scene, upperMesh, cityGmlMe, volumeCalcDetailVal)
      //分割（下）の体積の近似値を算出
      underVolume = totalVolume - upperVolume

      if (useShowResult) {
        const upperMtl = new BABYLON.StandardMaterial("upperMtl", scene)
        upperMtl.backFaceCulling = false
        upperMtl.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0.2)
        upperMtl.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5)
        upperMtl.alpha = 0.4
        upperMesh.material = upperMtl
      }

      //方角補正
      const upperMeshNode = new BABYLON.TransformNode("UpperMeshNode", scene)
      upperMesh.parent = upperMeshNode
      upperMeshNode.rotation = new BABYLON.Vector3(0, -Math.PI * 0.5, 0)

      //CloneしたmeshForUnderProcessingをGlbExportに含まないoption設定
      let options = {
        shouldExportNode: function (node: BABYLON.Node) {
          return node !== underProcessNode;
        },
      };

      upperGlb = await GLTF2Export.GLBAsync(scene, `${filePrefix}Upper`, options)
    } catch (e) {
      upperGlb = undefined
      console.log(`UpperGLB Not Create`)
    }

    //UnderGLB作成
    if (useShowResult) {
      this.objectManager.disposeNodes(scene, ["camera", "light", underProcessNodeName])
    } else {
      this.objectManager.disposeNodes(scene, [underProcessNodeName])
    }

    underProcessMesh.isVisible = true

    let underMesh: BABYLON.Mesh | undefined
    let underGlb: GLTFData | undefined = undefined
    try {
      underMesh = this.cutCalculatedHeight(scene, cityGmlMe, underProcessMesh, true)
      underMesh.name = "underMesh"
      underProcessNode.dispose(false, true)

      if (useShowResult) {
        const underMtl = new BABYLON.StandardMaterial("underMtl", scene)
        underMtl.backFaceCulling = false
        underMtl.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.8)
        underMtl.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5)
        underMtl.alpha = 0.4
        underMesh.material = underMtl
      }

      const underMeshNode = new BABYLON.TransformNode("UnderMeshNode", scene)
      underMesh.parent = underMeshNode
      //方角を補正
      underMeshNode.rotation = new BABYLON.Vector3(0, -Math.PI * 0.5, 0)
      underGlb = await GLTF2Export.GLBAsync(scene, `${filePrefix}Under`)

      underMeshNode.dispose(false, true)
    } catch (e) {
      console.log(`UnderGLB Not Create`)
    }

    if (useShowResult) {
      this.objectManager.disposeNodes(scene, ["camera", "light"])
    } else {
      this.objectManager.disposeNodes(scene, [])
    }

    return {
      totalGlb: totalGlb,
      upperGlb: upperGlb,
      underGlb: underGlb,
      totalGlbName: `${filePrefix}Total`,
      upperGlbName: `${filePrefix}Upper`,
      underGlbName: `${filePrefix}Under`,
      totalVolume: totalVolume,
      upperVolume: upperVolume,
      underVolume: underVolume
    }
  }

  /*** 算出した高さでカットする */
  private cutCalculatedHeight = (scene: BABYLON.Scene, cutHeight: number, resultMesh: BABYLON.Mesh, isCutUpper: boolean) => {

    const topCutWid = 200

    const topCutPoints: BABYLON.Vector3[] = [
      new BABYLON.Vector3(topCutWid, 0, -topCutWid),
      new BABYLON.Vector3(topCutWid, 0, topCutWid),
      new BABYLON.Vector3(-topCutWid, 0, topCutWid),
      new BABYLON.Vector3(-topCutWid, 0, -topCutWid),
    ]

    const cutDepth = 200
    const cutMesh = new ExtrudePolygonMeshCreator().createExtrude(scene, topCutPoints, cutDepth)

    if (isCutUpper) {
      cutMesh.position = new BABYLON.Vector3(0, cutDepth + cutHeight, 0)
    } else {
      cutMesh.position = new BABYLON.Vector3(0, cutHeight, 0)
    }

    const heightCutMesh = this.booleanOperator.createSubtract(scene, resultMesh, cutMesh)

    heightCutMesh.isVisible = true
    return heightCutMesh
  }

  /*** 積層面積計算から算出した容積値を返す */
  private getVolumeValue = (scene: BABYLON.Scene, resultMesh: BABYLON.Mesh, startHeight: number, detail: number) => {
    const areaNode: BABYLON.TransformNode = new BABYLON.TransformNode("BaseNode2", scene)
    let loopCount = 0
    let totalVolume = 0
    let depth = 200

    while (true) {
      const targetAreaHeight = loopCount * detail + startHeight
      let topAreaParam = this.stackAreaCalc(scene, resultMesh, targetAreaHeight, startHeight, depth)
      topAreaParam.areaMesh.parent = areaNode

      if (topAreaParam.areaVol === 0) {
        break
      }

      totalVolume = totalVolume + topAreaParam.areaVol * detail
      loopCount++
    }

    areaNode.dispose(false, true)

    return totalVolume
  }

  /*** 面積計算 */
  private stackAreaCalc = (scene: BABYLON.Scene, resultMesh: BABYLON.Mesh, floorHeight: number, startHeight: number, depth: number) => {

    const sliceMesh: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("sliceMesh", {
      size: 1,
      updatable: true
    }, scene)

    sliceMesh.scaling = new BABYLON.Vector3(250, 0.000012, 250)
    let ground = 0

    if (floorHeight <= 0.001 + startHeight) {
      ground = 0.000006
    } else if (floorHeight >= depth + startHeight) {
      ground = -0.000006
    }

    sliceMesh.position = new BABYLON.Vector3(0, ground + floorHeight, 0)
    const areaMesh = this.booleanOperator.createIntersect(scene, resultMesh, sliceMesh)
    areaMesh.name = "FloorMesh"
    const area = this.surfaceAreaCalc.surfaceArea(areaMesh, true)
    return {areaVol: area, areaMesh: areaMesh}
  }
}

export default VolumeShapeDataCreator