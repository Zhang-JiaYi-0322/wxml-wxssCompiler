// import * as _parser from "./parser/parser";
// // import { deleteEmpty } from "./vdom/deleteEmpty";
// // import { _patch } from "./vdom/main";
// // import { transformToJson } from "./vdom/wx2json";
// // import { Element } from "./vdom/WXObject/Element";
// export const parser = _parser.parser;


// let map: any = {};

// // binding: 数据绑定
// // bindViewTap: 事件处理函数
// // onLoad:
// // getUserInfo:
// // url: wxml.js路径
// export async function runtimeCompile(binding: any, bindViewTap: any, onLoad: any, getUserInfo: any, url: string = "") {
//     const WX = require("./vdom/WXObject/map");
//     // let url = '';
//     let text = '';
//     if (typeof window !== 'undefined') {
//         text = await loadText(url);
//     }

//     const code = eval(text);
//     // console.log('code\n', parser(text).code);

//     let base = null;
//     let other = null;
//     if (map[url]) {
//         base = map[url];
//     }
//     else {
//         base = new Element();
//         // map[url] = base;
//         if (!base.element.style) base.element.style = {};
//         base.element.style.position = "relative";
//         base.element.style.top = "10px";
//         document.body.appendChild(base.element);
//     }


//     const node = code(binding);
//     if (map[url]) {
//         other = new Element();
//         for (const key in node) {
//             const item = node[key];
//             // keys.push(key);
//             other.appendChild(item);
//         }
//         // deleteEmpty(other);
//         transformToJson(other);

//         console.log("other", other)
//         _patch(base, other.rightNode);
//     }
//     else {
//         map[url] = base;
//         for (const key in node) {
//             const item = node[key];
//             // keys.push(key);
//             base.appendChild(item);
//         }

//         _patch(base);
//     }

//     console.log("base", base)

// }

// function loadText(url: string): any {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.onload = () => {
//             resolve(xhr.responseText);
//         }
//         xhr.open('get', url);
//         xhr.send();
//     })
// }

// if (typeof window !== 'undefined') {
//     window['runtimeCompile'] = runtimeCompile
//     window['parser'] = parser
// }
// else {
//     module.exports = { runtimeCompile, parser };
// }