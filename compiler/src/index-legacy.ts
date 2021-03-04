// import { parser } from "./parser/parser";
// // import { deleteEmpty } from "./vdom/deleteEmpty";
// // import { _patch } from "./vdom/main";
// // import { transformToJson } from "./vdom/wx2json";
// // import { Element } from "./vdom/WXObject/Element";



// let map: any = {};

// // binding: 数据绑定
// // bindViewTap: 事件处理函数
// // onLoad:
// // getUserInfo:
// export function runtimeCompile(binding: any, bindViewTap: any, onLoad: any, getUserInfo: any) {
//     const WX = require("./vdom/WXObject/map");
//     const url = './webpack-dev-server/leftNode';
//     const text = `
//     <button id="button" lang="cn" hidden="{{false}}">
//         <button wx:for="{{[1,2,3]}}" wx:for-item="item">
//             <button>{{item}}</button>
//         </button>
//         <button wx:if="{{a}}">
//             <button >true456 </button>
//             <button >123 </button>
//         </button>
//         <button wx:else>
//             <button >123 </button>
//             <button > false456  </button>
//         </button>
//         </button>
//         `;
//     const code = eval(parser(text, url).code);
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
//         // transformToJson(other);

//         console.log("other", other)
//         // _patch(base, other.rightNode);
//     }
//     else {
//         map[url] = base;
//         for (const key in node) {
//             const item = node[key];
//             // keys.push(key);
//             base.appendChild(item);
//         }

//         // _patch(base);
//     }

//     console.log("base", base)

// }