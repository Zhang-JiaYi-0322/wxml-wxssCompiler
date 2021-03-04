export function isVirtualNode(x: any): boolean {
    // return x && x.TYPE === "VirtualNode";
    return x && x.label;
}