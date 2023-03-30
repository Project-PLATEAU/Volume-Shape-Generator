import {CSG, Mesh, Scene} from '@babylonjs/core'

class BooleanOperator {

  createSubtract = (scene: Scene, meshA: Mesh, meshB: Mesh, isVisibleOriginals: boolean = false): Mesh => {
    const csgMeshA = CSG.FromMesh(meshA)
    const csgMeshB = CSG.FromMesh(meshB)
    const booleanCSG = csgMeshA.subtract(csgMeshB)
    const newMesh = booleanCSG.toMesh("newMesh", null, scene)
    newMesh.useVertexColors = true
    meshA.isVisible = isVisibleOriginals
    meshB.isVisible = isVisibleOriginals
    meshA.dispose()
    meshB.dispose()
    return newMesh
  }

  createIntersect = (scene: Scene, meshA: Mesh, meshB: Mesh, isVisibleOriginals: boolean = false): Mesh => {
    const csgMeshA = CSG.FromMesh(meshA)
    const csgMeshB = CSG.FromMesh(meshB)
    const booleanCSG = csgMeshA.intersect(csgMeshB)
    const newMesh = booleanCSG.toMesh("newMesh", null, scene)
    newMesh.useVertexColors = true
    meshA.isVisible = isVisibleOriginals
    meshB.isVisible = isVisibleOriginals
    meshB.dispose()
    return newMesh
  }
}

export default BooleanOperator
