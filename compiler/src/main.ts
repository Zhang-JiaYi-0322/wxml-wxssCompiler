import { parser } from './parser/parser';
import fs from 'fs';
import path from 'path';

const filename = "test5";
let dirname = "Lexer";
dirname = 'SyntacticParser';
const buttonText = fs.readFileSync(path.join(__dirname, `../../lib/demo/Button.ts`), 'utf-8');
const text = fs.readFileSync(path.join(__dirname, `../../mochaTest/${dirname}/lib/${filename}/input.nex`), "utf-8");
const result = parser(text, `../../mochaTest/${dirname}/lib/${filename}/input.nex`).code;
// fs.writeFileSync('./result.js', buttonText + '\n\n' + result, 'utf-8');
fs.writeFileSync('./result.js', '' + '\n\n' + result, 'utf-8');