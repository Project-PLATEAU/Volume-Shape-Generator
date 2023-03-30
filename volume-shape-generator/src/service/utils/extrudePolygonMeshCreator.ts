import * as BABYLON from '@babylonjs/core'
import * as earCut from 'earcut'

/*** 押し出しによるポリゴン作成、Meshを返す */
class ExtrudePolygonMeshCreator {

  /*** 押し出しMesh形成 */
  createExtrude = (
    scene: BABYLON.Scene,
    params: BABYLON.Vector3[],
    depth: number | undefined,
    wrap: boolean = true,
    holes: BABYLON.Vector3[][] | undefined = undefined,
    updatable: boolean = true,
  ) => {
    const positionsForExtrude: BABYLON.Vector3[] = []
    for (const param of params) {
      const p = new BABYLON.Vector3(
        param.x,
        0,
        param.z
      )
      positionsForExtrude.push(p)
    }

    return BABYLON.MeshBuilder.ExtrudePolygon("polygon",
      {
        shape: positionsForExtrude,
        depth: depth,
        wrap: wrap,
        holes: holes,
        updatable: updatable,
        sideOrientation: BABYLON.Mesh.DEFAULTSIDE
      }, scene, earCut.default)
  }
}

export default ExtrudePolygonMeshCreator