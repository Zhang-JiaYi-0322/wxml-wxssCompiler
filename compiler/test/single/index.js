const { parser } = require('../../out/parser/parser');
const fs = require('fs');

const url = './test/single/simple.wxml';
const text = fs.readFileSync(url, 'utf-8').replace(/'/g, '"');
const result = parser(text, url);
fs.writeFileSync('./test/single/output.wxml.js', result.code, 'utf-8');