var noChild = {};
// tree: patches.a
export function domIndex(rootNode: any, tree: any, indices: number[], nodes?: any): any {
    if (!indices || indices.length === 0) {
        return {};
    }
    else {
        // 升序排列
        indices.sort(ascending);
        return recurse(rootNode, tree, indices, nodes, 0);
    }
}

// 采用二分法，借助 rootIndex 计数，间接找到与 patches 对应的对象
function recurse(rootNode: any, tree: any, indices: number[], nodes: any, rootIndex: number): any {
    nodes = nodes || {};

    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode;
        }

        const vChildren = tree.children;
        if (vChildren) {
            const childNodes = rootNode.children;
            for (let i = 0; i < tree.children.length; i++) {
                rootIndex += 1;

                const vChild = vChildren[i] || noChild;
                const nextIndex = rootIndex + (vChild.count || 0);
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices: number[], left: number, right: number): boolean {
    if (indices.length === 0) {
        return false;
    }

    let minIndex = 0;
    let maxIndex = indices.length - 1;
    let currentIndex: number;
    let currentItem: number;

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0;
        currentItem = indices[currentIndex];

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right;
        } else if (currentItem < left) {
            minIndex = currentIndex + 1;
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1;
        } else {
            return true;
        }
    }

    return false;
}

function ascending(a: number, b: number): any {
    return a > b ? 1 : -1
}