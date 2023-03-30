import * as BABYLON from '@babylonjs/core'

type BuildingParam = {
  siteArea: number //敷地面積
  building: BABYLON.Vector3[] //建物形状ローカル座標
  syasenPlanes: BABYLON.Vector3[][] //道路外側斜線制限面ローカル
  rinchPlanes: BABYLON.Vector3[][] //隣地斜線制限面ローカル
  citygml_me: number //元のビルの高さに相当
  far: number //容積率
  kaidaka: number //階高
  maxLimitH: number | null //生成する建物の高さをこの値で制限.容積率より優先
}

export default BuildingParam