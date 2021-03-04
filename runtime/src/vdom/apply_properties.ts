import isObject from "is-object";
import { getPrototype } from './utils/getPrototype';

// node 为 html DOM 对象
export function applyProperties(node: any, props: any, previous?: any): void {
    for (const propName in props) {
        const propValue = props[propName];

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        }
        else {
            if (isObject(propValue)) {
                patchObject(node, previous, propName, propValue);
            }
            else {
                node.setAttribute(propName, propValue);
                // node[propName] = propValue;
            }
        }
    }
}

function removeProperty(node: any, propName: string, propValue: any, previous: any): void {
    // 有旧版本的时候移除旧版本中的属性
    if (previous) {
        const previousValue = previous[propName]
        // if (propName == "attributes") {
        //     for (const attrName in previousValue) {
        //         node.removeAttribute(attrName);
        //     }
        // }
        // else if (propName == 'style') {
        //     for (const i in previousValue) {
        //         node.style[i] = "";
        //     }
        // }
        if (typeof previousValue == "string") {
            node.setAttribute(propName, "");
            // node[propName] = "";
        }
        else {
            node.setAttribute(propName, null);
            // node[propName] = null;
        }
    }
}

function patchObject(node: any, previous: any, propName: string, propValue: any): void {
    const previousValue = previous ? previous[propName] : undefined;

    // if (propName == "attributes") {
    //     for (const attrName in propValue) {
    //         const attrValue = propValue[attrName]

    //         if (attrValue == undefined) {
    //             node.removeAttribute(attrName)
    //         } else {
    //             node.setAttribute(attrName, attrValue)
    //         }
    //     }

    //     return
    // }

    // 当原值存在且为对象，且新旧值不相等时
    if (previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node.setAttribute(propName, propValue);
        // node[propName] = propValue;
        return;
    }





    // 类型为 object 但是无值时
    if (!isObject(node[propName])) {
        // node[propName] = {};
        node.setAttribute(propName, {});
    }

    // const replacer = propName == "style" ? "" : undefined;
    let obj = {}
    for (const k in propValue) {
        const value = propValue[k];
        obj[k] = (value === undefined) ? undefined : value;
        // node[propName][k] = (value === undefined) ? replacer : value;
    }
    // console.log(propName)
    node.setAttribute(propName, obj);
}


