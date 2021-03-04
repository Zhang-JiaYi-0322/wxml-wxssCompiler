
export function deleteEmpty(node: any): any {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].isEmpty || children[i].shouldDelete) {
            node.removeChild(children[i]);
            i--;
        }
    }
    for (const child of node.children) {
        deleteEmpty(child);
    }
}