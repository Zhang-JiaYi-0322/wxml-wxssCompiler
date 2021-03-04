import isObject from 'is-object';
import { getPrototype } from './utils/getPrototype';

export function diffProps(a: any, b: any): any {
    let diff = null;

    for (const aKey in a) {
        if (aKey === 'key')
            continue;
        if (aKey === "children")
            continue;
        // a 中有该属性，b 中没有
        if (!(aKey in b)) {
            // 初始化 diff
            diff = diff || {};
            diff[aKey] = undefined;
        }

        const aValue = a[aKey];
        const bValue = b[aKey];

        // a,b 中属性值相等
        if (aValue === bValue) {
            continue;
        }
        // 同为对象
        else if (isObject(aValue) && isObject(bValue)) {
            // a,b 不是同一类对象
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {};
                diff[aKey] = bValue;
            }
            // 是同一类对象，递归属性
            else {
                const objectDiff = diffProps(aValue, bValue);
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff;
                }
            }
        }
        // 其他情况
        else {
            if (aKey == 'count') continue;
            diff = diff || {};
            diff[aKey] = bValue;
        }

    }

    // a 中没有属性，b 中有：新增加属性的情况
    for (const bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {};
            diff[bKey] = b[bKey];
        }
    }

    return diff;
}
