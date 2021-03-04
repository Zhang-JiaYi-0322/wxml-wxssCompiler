import fs from "fs";
import { NexLexer } from "./Lexer/Lexer";
import { SyntacticParser } from "./SyntacticParser/SyntacticParser";
import { AstGenerator } from './AstGenerator/Generator';
import { generate } from 'astring';



let text = [];
let _filePath = '';

export function parser(rawText: string, filePath: string = "") {

    text = rawText.split('\r\n');
    _filePath = filePath;

    const lexer = new NexLexer(rawText);
    const tokens = lexer.analysis();
    // fs.writeFileSync('./tokens.json', JSON.stringify({ root: tokens }, null, 4), 'utf-8');
    const parer = new SyntacticParser(tokens);
    const tree = parer.parseAST();
    const generator = new AstGenerator();
    // fs.writeFileSync('./tree.json', JSON.stringify(tree, null, 4), 'utf-8');
    // console.log('SyntacticParser')
    const ast = generator.generateAst(tree);
    // fs.writeFileSync('./result.json', JSON.stringify(ast, null, 4), 'utf-8');
    // console.log('generateAst')
    const code = generate(ast);
    // fs.writeFileSync('./result.js', code, 'utf-8');
    // console.log('generate')
    return { tokens, tree, ast, code };


}


export function error(message: string, line?: number, row?: number): void {
    let arr = [];
    let _text = '';
    const x = row + 1;
    const y = line + 1;
    let maxLength = 0;
    const err1 =
        `Error: 
in File: ${_filePath}

${message}
`;
    const err2 =
        `at
file: ${_filePath} #${y}
`;
    let i = 3;
    while (i >= 0) {
        if (text.length >= y + i) {
            maxLength = (y + i).toString().split("").length;
            break;
        }
        i--;
    }

    for (let j = 3; j > 1; j--) {
        if (text.length > y - j && -1 < y - j) {
            _text = `  ${y - j + 1} | `;
            if ((y - j).toString().length < maxLength) {
                _text = " " + _text;
            }
            _text += text[y - j];
            arr.push(_text);
        }
    }

    _text = ` ${y} | `;
    if (y < maxLength) {
        _text = " " + _text;
    }
    _text = '>' + _text;
    _text += text[y - 1];
    arr.push(_text);
    _text = `   | `;
    for (let i = 0; i < maxLength; i++) {
        _text = " " + _text;
    }
    let length = _text.length;
    let _arr = _text.split('');
    for (let i = length; i < x + length - 1; i++) {
        _arr[i] = " ";
    }
    _arr[x + length - 1] = '^';
    arr.push(_arr.join(""));

    for (let k = 0; k < 3; k++) {
        if (text.length > y + k && -1 < y + k) {
            _text = `  ${y + k + 1} | `;
            if ((y + k).toString().length < maxLength) {
                _text = " " + _text;
            }
            _text += text[y + k];
            arr.push(_text);
        }
    }
    const result = err1 + arr.join("\r\n") + "\r\n" + err2;
    throw (result);
};
