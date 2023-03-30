import * as BABYLON from '@babylonjs/core'
import VolumeShapeGenerator from '../service/api/volumeShapeGenerator'
import BabylonSetup from './babylonSetup'
import BuildingParamSample from './buildingParamSample'


/*** Sample */
class VolumeShapeGenerateController {

  private volumeShapeGenerator = new VolumeShapeGenerator()
  private volumeCalcDetailVal = 0.05
  private filePrefix = "VolumeShapeData"
  private useShowResult = true

  startOperation = async () => {

    const totalGlbDlBtn = document.getElementById("totalGlbDownloadButton") as HTMLButtonElement
    const upperGlbDlBtn = document.getElementById("upperGlbDownloadButton") as HTMLButtonElement
    const underGlbDlBtn = document.getElementById("underGlbDownloadButton") as HTMLButtonElement
    const volumeResultText = document.getElementById("volumeResult") as HTMLParagraphElement

    //Babylon Setting
    const className = "babylonRenderCanvas"
    const collection = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLCanvasElement>
    const canvas: HTMLCanvasElement = collection.item(0)!
    const scene = new BabylonSetup().createScene(canvas)

    //Get VolumeShapesData
    const buildingParams = new BuildingParamSample().getParamsJsonText()
    const volumeShapesData = await this.volumeShapeGenerator.getVolumeShapesData(buildingParams, scene, this.volumeCalcDetailVal, this.filePrefix, this.useShowResult)
    const shapeData = volumeShapesData[0]

    //生成したファイルのロードと表示サンプル
    if (this.useShowResult) {
      if (shapeData.upperGlb !== undefined) {
        const assetBlob = shapeData.upperGlb!.glTFFiles[`${this.filePrefix}Upper.glb`] as Blob
        const assetUrl: string = URL.createObjectURL(assetBlob)
        await BABYLON.SceneLoader.AppendAsync(assetUrl, undefined, scene, undefined, ".glb")
      }

      if (shapeData.underGlb !== undefined) {
        const assetBlob2 = shapeData.underGlb!.glTFFiles[`${this.filePrefix}Under.glb`] as Blob
        const assetUrl2: string = URL.createObjectURL(assetBlob2)
        await BABYLON.SceneLoader.AppendAsync(assetUrl2, undefined, scene, undefined, ".glb")
      }
    }

    volumeResultText.textContent = `Volume : [Total] ${shapeData.totalVolume} [Upper] ${shapeData.upperVolume} [Under] ${shapeData.underVolume}`

    //生成したファイルのダウンロードテスト
    if (shapeData.totalGlb !== null) {
      totalGlbDlBtn.hidden = false
      totalGlbDlBtn.onclick = () => {
        shapeData.totalGlb?.downloadFiles()
      }
    }

    if (shapeData.upperGlb !== null) {
      upperGlbDlBtn.hidden = false
      upperGlbDlBtn.onclick = () => {
        shapeData.upperGlb?.downloadFiles()
      }
    }

    if (shapeData.underGlb !== null) {
      underGlbDlBtn.hidden = false
      underGlbDlBtn.onclick = () => {
        shapeData.underGlb?.downloadFiles()
      }
    }
  }
}

export default VolumeShapeGenerateController