import * as BABYLON from '@babylonjs/core'

class CustomMeshCreator {

  createCustomMeshFromVec(
    scene: BABYLON.Scene, vectors: BABYLON.Vector3[], indices: number[]): BABYLON.Mesh {

    const pos: number[] = []

    for (const v of vectors) {
      const n1 = v.x
      const n2 = v.y
      const n3 = v.z
      pos.push(n1)
      pos.push(n2)
      pos.push(n3)
    }

    const customMesh: BABYLON.Mesh = new BABYLON.Mesh(`mesh_${pos}`, scene)

    let normals: number[] | Float32Array | null = [];
    BABYLON.VertexData.ComputeNormals(pos, indices, normals)

    //VertexDataをMeshにApply
    const vertexData = new BABYLON.VertexData()
    vertexData.positions = pos
    vertexData.indices = indices
    vertexData.normals = normals;
    vertexData.applyToMesh(customMesh, true)

    return customMesh
  }

  createIndices(targetVec: BABYLON.Vector3[]): number[] {

    const indices: number[] = []
    const totalLength = targetVec.length

    for (let i = 0; i < totalLength; i++) {
      const isInside = i % 2 === 0

      let p1: number = i
      let p2: number = i + 1
      let p3: number = i + 2

      if (i + 1 >= totalLength) {
        p2 = 0
        p3 = 1
      } else if (i + 2 >= totalLength) {
        p3 = 0
      }

      if (isInside) {
        indices.push(p1)
        indices.push(p3)
        indices.push(p2)
      } else {
        indices.push(p1)
        indices.push(p2)
        indices.push(p3)
      }
    }

    return indices
  }
}

export default CustomMeshCreator