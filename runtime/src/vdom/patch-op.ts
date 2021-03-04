import { VirtualPatch } from './core/vpatch';
import { applyProperties } from './apply_properties';
import { map } from '../components';

export function patchOp(vpatch: VirtualPatch, domNode: any, renderOptions: any): any {
    const type = vpatch.type
    const vNode = vpatch.vNode
    const patch = vpatch.patch
    switch (type) {
        case VirtualPatch.REMOVE:
            return removeNode(domNode, vNode);
        case VirtualPatch.INSERT:
            return insertNode(domNode, patch, renderOptions);
        // case VirtualPatch.VTEXT:
        //     return stringPatch(domNode, vNode, patch, renderOptions);
        // case VPatch.WIDGET:
        //     return widgetPatch(domNode, vNode, patch, renderOptions)
        case VirtualPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions);
        case VirtualPatch.ORDER:
            reorderChildren(domNode, patch);
            return domNode;
        case VirtualPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties);
            return domNode;
        // case VPatch.THUNK:
        //     return replaceRoot(domNode,
        //         renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode: any, vNode: any): any {
    const parentNode = domNode.parent;
    if (parentNode) {
        parentNode.removeChild(domNode);
    }

    return null;
}

function insertNode(parentNode: any, vNode: any, renderOptions: any): any {
    if (!vNode) return;
    const newNode = new map[vNode.label]();
    if (vNode.shouldDelete) newNode['shouldDelete'] = true;
    newNode.initialize(vNode);
    newNode.children = [];
    if (parentNode) {
        parentNode._appendChild(newNode);
        for (const child of vNode.children) {
            _insertNode(newNode, child);
        }
    }
    return parentNode;
}

function _insertNode(parentNode: any, vNode: any): void {
    const newNode = new map[vNode.label]();
    newNode.initialize(vNode);
    newNode.children = [];
    parentNode._appendChild(newNode);
    for (const child of vNode.children) {
        _insertNode(newNode, child);
    }
}

function vNodePatch(domNode: any, leftVNode: any, vNode: any, renderOptions: any): any {
    var parentNode = domNode.parent;
    var newNode = new map[vNode.label](vNode);

    if (parentNode && newNode !== domNode) {
        parentNode._replaceChild(newNode, domNode);
    }

    return newNode;
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.children
    var keyMap = {}
    var node
    var remove
    var insert
    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        // fix bug
        if (node && node.key === remove.key) {
            if (remove.key) {
                keyMap[remove.key] = node
            }
            domNode.removeChild(node)
        }
        else {
            console.log(remove.key, childNodes)
        }
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // fix bug
        if (node && node.key === insert.key) {
            // this is the weirdest bug i've ever seen in webkit
            domNode._insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
        }
    }
}