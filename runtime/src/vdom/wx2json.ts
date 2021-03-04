

export function transformToJson(obj: any): void {
    let node = {
        // TYPE: "VirtualNode",
        // tagName: "",
        // properties: {},
        // children: []
        count: obj.children.length
    };

    const keys = Object.keys(obj);
    for (const key of keys) {
        let item = obj[key];

        if (['leftNode', 'rightNode', 'htmlElement', 'parent', 'counted', 'root', 'count'].includes(key))
            continue;
        else if (key.search(/^onAttributeChange/g) > -1) {
            continue;
        }
        else if (key === 'children') {
            node[key] = [];
            // item = obj[key];
            for (const child of item) {
                transformToJson(child);
                node[key].push(child.rightNode);
                node.count += child.rightNode.count;
            }
        }
        else
            node[key] = item;
    }
    obj.setRightNode(node);
}