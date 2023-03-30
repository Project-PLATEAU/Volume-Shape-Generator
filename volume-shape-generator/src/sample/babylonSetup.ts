import * as BABYLON from '@babylonjs/core';

class BabylonSetup {

  createScene = (canvas: HTMLCanvasElement) => {
    const engine = new BABYLON.Engine(canvas, true)
    const scene = new BABYLON.Scene(engine)

    engine.runRenderLoop(() => {
      scene.render()
    })

    window.addEventListener("resize", () => {
      engine.resize()
    })

    this.setupEnv(scene, canvas)

    return scene
  }

  /*** Babylonのカメラやライトなど環境設定 */
  private setupEnv = (scene: BABYLON.Scene, canvas: HTMLCanvasElement) => {

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 50, new BABYLON.Vector3(0, 10, 0))

    camera.attachControl(canvas, true)

    camera.maxZ = 100001
    camera.minZ = 0.2

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, -1, 0), scene)
    new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene)

    //マウスポインタがCanvas上にある場合ページのスクロールを行わない
    canvas.addEventListener('wheel', evt => evt.preventDefault());
  }
}

export default BabylonSetup
