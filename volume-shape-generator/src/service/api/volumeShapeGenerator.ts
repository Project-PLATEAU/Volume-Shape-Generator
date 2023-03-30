import BuildingShapeCreator from '../core/buildingShapeCreator'
import VolumeShapeDataCreator from '../core/volumeShapeDataCreator'
import BuildingParam from '../core/buildingParam'
import * as BABYLON from '@babylonjs/core'
import {GLTFData} from '@babylonjs/serializers/glTF'
import NodeController from '../utils/nodeController'

class VolumeShapeGenerator {

  private buildingShapeCreator = new BuildingShapeCreator()
  private volumeShapeDataCreator = new VolumeShapeDataCreator()

  /*** 容積値とGLBの取得 */
  getVolumeShapesData = async (jsonText: string, scene: BABYLON.Scene, volumeCalcDetailVal: number = 0.01, filePrefix: string = "VolumeShapeData", useShowResult: boolean = false) => {

    const buildingParams = this.getBuildingParams(jsonText)

    let resultDataArray: {
      totalGlb: GLTFData
      upperGlb: GLTFData | undefined
      underGlb: GLTFData | undefined
      totalGlbName: string
      upperGlbName: string
      underGlbName: string
      totalVolume: number
      upperVolume: number
      underVolume: number
    }[] = []

    for (const buildingParam of buildingParams) {
      //建物フットプリントからMesh生成、隣地斜線制限や道路斜線制限、高さ制限の条件からカット
      const resultMeshName = this.buildingShapeCreator.cutBasedOnRestrictions(scene, buildingParam)

      //体積,GLBファイルを取得
      const resultData =
        await this.volumeShapeDataCreator.getGlbAndVolumeValue(scene, buildingParam.citygml_me, volumeCalcDetailVal, filePrefix, resultMeshName, useShowResult)

      resultDataArray.push(resultData)
    }

    return resultDataArray
  }

  private getBuildingParams = (jsonText: string) => {
    const params: BuildingParam[] = JSON.parse(jsonText)
    return params
  }

  /*** Objectの破棄。第二引数はRootNodeで破棄を無視するObjectの名称を入力する */
  disposeObject = (scene: BABYLON.Scene, ignoreRootNodeNames: string[] = []) => {
    new NodeController().disposeNodes(scene, ignoreRootNodeNames)
  }
}

export default VolumeShapeGenerator