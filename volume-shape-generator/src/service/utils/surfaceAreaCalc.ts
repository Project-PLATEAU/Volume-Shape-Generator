import * as BABYLON from '@babylonjs/core'

/*** Meshの表面積を求める */
class SurfaceAreaCalc {

  private nbFaces: number = 0

  surfaceArea = (mesh: BABYLON.Mesh, isTopSurfaceOnly: boolean) => {
    if (!mesh) {
      return 0.0
    }

    let ar = 0.0

    const indices = mesh.getIndices()!
    const nbFaces = indices.length / 3
    this.nbFaces = nbFaces

    for (let i = 0; i < nbFaces; i++) {
      ar = ar + this.facetArea(mesh, i, isTopSurfaceOnly)
    }

    return ar
  }

  private facetArea = (mesh: BABYLON.Mesh, faceId: number, isTopSurfaceOnly: boolean) => {
    if (!mesh) {
      return 0.0
    }

    let indices = mesh.getIndices()!

    if (faceId < 0 || faceId > this.nbFaces) {
      return 0.0
    }

    this.nbFaces = indices.length / 3
    let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!
    let v1x: number
    let v1y: number
    let v1z: number
    let v2x: number
    let v2y: number
    let v2z: number
    let crossX: number
    let crossY: number
    let crossZ: number
    let i1: number
    let i2: number
    let i3: number

    i1 = indices[faceId * 3];
    i2 = indices[faceId * 3 + 1];
    i3 = indices[faceId * 3 + 2];
    v1x = positions[i1 * 3] - positions[i2 * 3];
    v1y = positions[i1 * 3 + 1] - positions[i2 * 3 + 1];
    v1z = positions[i1 * 3 + 2] - positions[i2 * 3 + 2];
    v2x = positions[i3 * 3] - positions[i2 * 3];
    v2y = positions[i3 * 3 + 1] - positions[i2 * 3 + 1];
    v2z = positions[i3 * 3 + 2] - positions[i2 * 3 + 2];
    crossX = v1y * v2z - v1z * v2y;
    crossY = v1z * v2x - v1x * v2z;
    crossZ = v1x * v2y - v1y * v2x;

    //Meshの上面(上面かつ傾きのない面)の面積のみ求める
    let l = new BABYLON.Vector3(crossX, crossY, crossZ).normalize()
    let r = new BABYLON.Vector3(0, 1, 0)
    const dot = BABYLON.Vector3.Dot(l, r)

    const area = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5

    if (!isTopSurfaceOnly) {
      return area
    }

    if (dot > 0.9999) {
      return area
    } else {
      return 0.0
    }
  }
}

export default SurfaceAreaCalc
