import { deleteEmpty } from './deleteEmpty';
import { diff } from './diff';
import { patch } from './patch';
import { transformToJson } from './wx2json';


export function updateNode(rootNode: any, rightNode?: any): void {
    if (!rootNode.counted) {
        rootNode.setCount();
        rootNode.counted = true;
    }
    transformToJson(rootNode);
    // console.log('rootNode', rootNode);
    // console.log(JSON.stringify(rootNode.rightNode, null, 4))
    const patches = diff(rootNode.rightNode, rightNode ? rightNode : rootNode.rightNode);
    // console.log('patches', patches)
    const result = patch(rootNode, patches);
    // console.log(`beforeDelete`, rootNode);
    deleteEmpty(rootNode);
    // console.log(`rightNode`, rightNode)
    // console.log(`afterDelete`, rootNode)
    transformToJson(rootNode);
}
