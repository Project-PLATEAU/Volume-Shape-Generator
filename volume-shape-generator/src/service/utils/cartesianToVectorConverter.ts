import * as BABYLON from '@babylonjs/core'

class CartesianToVectorConverter {

  /*** Babylon用のXYZ座標に変換 */
  convertCartesianToVectors = (cartesian3s: BABYLON.Vector3[]) => {

    const vec3Arr: BABYLON.Vector3[] = []

    for (const cartesian3 of cartesian3s) {
      const vec = new BABYLON.Vector3(cartesian3.x, cartesian3.z, cartesian3.y)
      vec3Arr.push(vec)
    }

    return vec3Arr
  }
}

export default CartesianToVectorConverter
