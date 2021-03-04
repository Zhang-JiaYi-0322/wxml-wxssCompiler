import { isVirtualNode } from '../utils/is-vnode';

export class VirtualNode {
    TYPE = 'VirtualNode';
    tagName: string;
    properties = {};
    children = [];
    count = 0;

    constructor(tagName: string, properties: any, children: any[]) {
        this.tagName = tagName;
        this.properties = properties;
        this.children = children;

        let count = (children && children.length) || 0;
        let descendants = 0;
        for (const child of children) {
            if (isVirtualNode(child)) {
                descendants += child.count || 0;
            }
        }
        this.count = count + descendants;
    }
}
