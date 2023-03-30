import * as BABYLON from '@babylonjs/core'
import CustomMeshCreator from '../utils/customMeshCreator'

/*** 隣地斜線制限、道路斜線制限でのカットに必要なメッシュ作成 */
class CuttingPlaneMeshCreator {

  private topHeight: number = 700 //この高さを越える物件はないという想定
  private customMeshCreator: CustomMeshCreator = new CustomMeshCreator()

  createCuttingPlaneMesh = (scene: BABYLON.Scene, targetVec3Arr: BABYLON.Vector3[]) => {
    const bottomMesh = this.createTopOrBottomMesh(scene, targetVec3Arr)
    const topSideVecArr = this.getTopSideVec3(targetVec3Arr)
    const topMesh = this.createTopOrBottomMesh(scene, topSideVecArr)
    const sideMesh = this.createSideMesh(scene, targetVec3Arr, topSideVecArr)
    const resultMesh: BABYLON.Mesh = BABYLON.Mesh.MergeMeshes([sideMesh, bottomMesh, topMesh])!
    return resultMesh
  }

  /*** 下底 上底のMesh作成 */
  private createTopOrBottomMesh(scene: BABYLON.Scene, targetVec3: BABYLON.Vector3[]): BABYLON.Mesh {

    const posNumbers: number[] = []
    targetVec3.reverse()
    targetVec3.map(vec3 => posNumbers.push(vec3.x, vec3.y, vec3.z))

    let indices: number[]

    if (targetVec3.length === 3) {
      indices = [0, 1, 2]
    } else {
      indices = [0, 1, 2, 2, 3, 0]
    }

    let normals: number[] | Float32Array | null = []
    BABYLON.VertexData.ComputeNormals(posNumbers, indices, normals)
    const customMesh = new BABYLON.Mesh("custom", scene)
    const vertexData = new BABYLON.VertexData()
    vertexData.positions = posNumbers
    vertexData.indices = indices
    vertexData.normals = normals
    vertexData.applyToMesh(customMesh)

    return customMesh
  }

  /*** 下底の頂点を元に topSide(上底)の頂点を取得 */
  private getTopSideVec3(vec3s: BABYLON.Vector3[]): BABYLON.Vector3[] {
    const topSideVec: BABYLON.Vector3[] = []
    vec3s.map(vec => topSideVec.push(new BABYLON.Vector3(vec.x, vec.y + this.topHeight, vec.z)))
    return topSideVec
  }

  private createSideMesh = (
    scene: BABYLON.Scene,
    targetVec3Arr: BABYLON.Vector3[],
    topSideVecArr: BABYLON.Vector3[]): BABYLON.Mesh => {

    const revTop: BABYLON.Vector3[] = topSideVecArr.reverse()
    //側面用の座標登録
    const totalVec3: BABYLON.Vector3[] = []
    for (let i = 0; i < revTop.length; i++) {
      totalVec3.push(revTop[i])
      totalVec3.push(targetVec3Arr[i])
    }

    const totalIndices: number[] = this.customMeshCreator.createIndices(totalVec3)
    //側面のMesh作成
    return this.customMeshCreator
      .createCustomMeshFromVec(scene, totalVec3, totalIndices)!


  }
}

export default CuttingPlaneMeshCreator
