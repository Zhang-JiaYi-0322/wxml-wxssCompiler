import isArray from "x-is-array";
import { VirtualPatch } from './core/vpatch';
import { VirtualNode } from './core/vnode';
import { isVirtualNode } from './utils/is-vnode';
import { isVirtualText } from './utils/is-vtext';
import { diffProps } from './diff-props';


export function diff(a: VirtualNode, b: VirtualNode): any {
    const patch = { a: a };
    walk(a, b, patch, 0);
    return patch;
}

function walk(a: any, b: any, patch: any, index: number): void {

    if (a === b) {
        return patch;
    }

    let apply = patch[index];
    let applyClear = false;

    // 新值为 null ，即删除的情况
    if (b == null) {
        // clearState(a, patch, index);
        // apply = patch[index];
        apply = appendPatch(apply, new VirtualPatch(VirtualPatch.REMOVE, a, b));
    }
    else if (isVirtualNode(b)) {
        if (isVirtualNode(a)) {
            if (a.label === b.label && a.id === b.id) {
                const propsPatch = diffProps(a, b);
                if (propsPatch) {
                    apply = appendPatch(apply, new VirtualPatch(VirtualPatch.PROPS, a, propsPatch));
                }
                apply = diffChildren(a, b, patch, apply, index);
            }
        }
        else {
            apply = appendPatch(apply, new VirtualPatch(VirtualPatch.VNODE, a, b));
        }
    }

    if (apply) {
        patch[index] = apply;
    }
    if (applyClear) {
        // clearState(a, patch, index);
    }
}

function diffChildren(a: any, b: any, patch: any, apply: any, index: number): void {
    const aChildren = a.children;
    const orderedSet = reorder(aChildren, b.children);
    const bChildren = orderedSet.children;

    const aLen = aChildren.length;
    const bLen = bChildren.length;
    const len = aLen > bLen ? aLen : bLen;

    for (let i = 0; i < len; i++) {
        const leftNode = aChildren[i];
        const rightNode = bChildren[i];
        index += 1;
        // 新增节点
        if (!leftNode) {
            if (rightNode) {
                if (rightNode.isEmpty) {
                    // apply = appendPatch(apply,
                    //     new VirtualPatch(VirtualPatch.INSERT, null, null));
                    // continue;
                    rightNode['shouldDelete'] = true;
                }
                // else {
                apply = appendPatch(apply,
                    new VirtualPatch(VirtualPatch.INSERT, null, rightNode));
                // }
            }
        }
        // 遍历
        else {
            walk(leftNode, rightNode, patch, index);
        }

        if (isVirtualNode(leftNode) && leftNode.count) {
            index += leftNode.count;
        }


    }

    if (orderedSet.moves) {
        apply = appendPatch(apply, new VirtualPatch(
            VirtualPatch.ORDER,
            a,
            orderedSet.moves
        ));
    }
    return apply;
}

function reorder(aChildren: any[], bChildren: any): any {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: k })
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({ key: wantedItem.key, to: k })
                    }
                }
                else {
                    inserts.push({ key: wantedItem.key, to: k })
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr: any[], index: number, key: any): any {
    arr.splice(index, 1);
    return {
        from: index,
        key
    }
}

function keyIndex(children: any[]): any {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

// function clearState(vnode: VDOM.VNode, patch: any, index: number) {

// }

function appendPatch(apply: any, patch: any): any {
    if (apply) {
        // apply 是数组的情况下加入数组
        if (isArray(apply)) {
            apply.push(patch);
        }
        // apply 是单一对象的情况下组成数组
        else {
            apply = [apply, patch];
        }

        return apply;
    }
    else {
        return patch;
    }
}