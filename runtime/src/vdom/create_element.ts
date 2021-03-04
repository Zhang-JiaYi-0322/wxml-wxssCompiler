import { applyProperties } from './apply_properties';
import { isVirtualNode } from './utils/is-vnode';
import { isVirtualText } from './utils/is-vtext';


export function createElement(vnode: any, opts?: any): any {

    const doc = opts ? opts.document || document : document;
    const warn = opts ? opts.warn : null;

    if (isVirtualText(vnode)) {
        return doc.createTextNode(vnode.text);
    }
    else if (!isVirtualNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode);
        }
        return null;
    }

    const node = doc.createElement(vnode.tagName);
    const props = vnode.properties;
    applyProperties(node, props);

    const children = vnode.children;
    for (let i = 0; i < children.length; i++) {
        const childNode = createElement(children[i], opts);
        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}