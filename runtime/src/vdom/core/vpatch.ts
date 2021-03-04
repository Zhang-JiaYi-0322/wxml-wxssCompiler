import { VirtualNode } from "./vnode";

export class VirtualPatch {

    TYPE = 'VirtualPatch';

    static None = 0;
    static VTEXT = 1;
    static VNODE = 2;
    static WIDGET = 3;
    static PROPS = 4;
    static ORDER = 5;
    static INSERT = 6;
    static REMOVE = 7;
    static THUNK = 8;
    type: number;
    vNode: any;
    patch: any;

    constructor(type: number, vNode: any, patch: any) {
        this.type = Number(type);
        this.vNode = vNode;
        this.patch = patch;
    }
}
