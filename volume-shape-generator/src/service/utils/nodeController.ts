import * as BABYLON from '@babylonjs/core'

/*** Nodeの検索、削除 */
class NodeController {

  searchNode = (scene: BABYLON.Scene, searchName: string) => {
    for (const rootNode of scene.rootNodes) {
      const node = this.searchNodeRecursive(rootNode, searchName)
      if (node !== undefined) {
        return node
      }
    }

    console.log(`Search Error : ${searchName} Not Found : return undefined`)
    return undefined
  }

  searchNodeRecursive = (node: BABYLON.Node, searchName: string): BABYLON.Node | undefined => {
    if (node.name === searchName) {
      return node
    }

    const children = node.getChildren()
    if (children.length === 0) {
      return undefined
    }

    for (const childNode of children) {
      const searchNode: BABYLON.Node | undefined = this.searchNodeRecursive(childNode, searchName)
      if (searchNode !== undefined) {
        return searchNode
      }
    }

    return undefined
  }

  disposeNodes = (scene: BABYLON.Scene, ignoreRootNodeNames: string[]) => {
    while (scene.rootNodes.length > ignoreRootNodeNames.length) {
      for (const rootNode of scene.rootNodes) {

        if (!this.checkIgnore(rootNode.name, ignoreRootNodeNames)) {
          this.disposeRecursive(rootNode, true)
        }
      }
    }
  }

  checkIgnore = (rootNodeName: string, ignoreRootNodeNames: string[]) => {
    for (const ignoreNodeName of ignoreRootNodeNames) {
      if (rootNodeName === ignoreNodeName) {
        return true
      }
    }
    return false
  }

  disposeRecursive = (node: BABYLON.Node, isDisposeSelf: boolean) => {
    const children = node.getChildren()
    if (children.length === 0) {
      if (isDisposeSelf) {
        node.dispose(false, true)
      }
      return
    }

    while (node.getChildren().length > 0) {
      for (const node of children) {
        this.disposeRecursive(node, true)
      }
    }
  }
}

export default NodeController