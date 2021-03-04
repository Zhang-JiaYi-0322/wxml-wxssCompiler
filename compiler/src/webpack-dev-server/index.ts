// import fs from 'fs';
// import { parser } from '../parser/parser';
// import { _patch } from '../vdom/main';
// import { transformToJson } from '../vdom/wx2json';
// import { Element } from '../vdom/WXObject/Element';
// import { map } from '../vdom/WXObject/map';
// const Button = map.Button;


// const base = new Element();
// const other = new Element();
// // let keys = [];

// const leftText = require('./leftNode');
// const rightText = require('./rightNode');

// const code = eval(parser(leftText).code);
// console.log('code\n', parser(leftText).code)

// const leftNode = code({ a: true });
// for (const key in leftNode) {
//     const item = leftNode[key];
//     // keys.push(key);
//     base.appendChild(item);
// }

// // transformToJson(base);
// _patch(base);
// if (!base.element.style) base.element.style = {};
// base.element.style.position = "relative";
// base.element.style.top = "10px";
// document.body.appendChild(base.element);
// console.log("base", base)


// const rightNode = code({ a: false });
// for (const key in rightNode) {
//     const item = rightNode[key];
//     // keys.push(key);
//     other.appendChild(item);
// }
// transformToJson(other);

// setTimeout(() => {
//     _patch(base, other.rightNode);
//     console.log('other.rightNode', other.rightNode)
//     console.log('base.rightNode', base.rightNode)
//     console.log("base", base)
// }, 1500);

// const leftText = require('./leftNode');
// import { runtimeCompile } from '../index-legacy';

// runtimeCompile({ a: true }, null, null, null);
// console.log('-----------------------------------')
// setTimeout(() => {
//     runtimeCompile({ a: false }, null, null, null);
// }, 1500);