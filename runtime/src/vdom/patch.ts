import { createElement } from "./create_element";
import isArray from "x-is-array";
import { domIndex } from "./dom-index";
import { patchOp } from './patch-op';


export function patch(rootNode: any, patches: any, renderOptions?: any): any {
    renderOptions = renderOptions || {};
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive;
    renderOptions.render = renderOptions.render || createElement;

    return renderOptions.patch(rootNode, patches, renderOptions);
}

function patchRecursive(rootNode: any, patches: any, renderOptions: any): any {
    const indices = patchIndices(patches);

    if (indices.length === 0) {
        return rootNode;
    }

    const index = domIndex(rootNode, patches.a, indices);
    // const ownerDocument = rootNode.ownerDocument;

    // if (!renderOptions.document && ownerDocument !== document) {
    //     renderOptions.document = ownerDocument;
    // }

    for (let i = 0; i < indices.length; i++) {
        const nodeIndex = indices[i];
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions);
    }

    return rootNode;
}

// rootNode：根节点
// domNode：需要修改的浏览器对象
// patchList：修改内容
function applyPatch(rootNode: any, domNode: any, patchList: any, renderOptions: any): any {
    if (!domNode) {
        return rootNode;
    }

    let newNode = null;

    if (isArray(patchList)) {
        for (const patch of patchList) {
            newNode = patchOp(patch, domNode, renderOptions);

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    }
    else {
        newNode = patchOp(patchList, domNode, renderOptions);

        if (domNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function patchIndices(patches: any): Array<number> {
    let indices = [];

    for (const key in patches) {
        if (key !== 'a') {
            indices.push(Number(key));
        }
    }
    return indices;
}