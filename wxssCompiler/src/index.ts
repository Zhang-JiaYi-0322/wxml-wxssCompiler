import { wxssConverter } from "@espkg/mina2vue";
import * as path from 'path';
import * as fs from 'fs-extra';
import { WXSSLexer } from './Lexer/Lexer';
import { Generator } from './Generator/Generator';

let text = [];
let _filePath = '';

export function run(wxmlProjectRoot: string, workspaceRoot: string) {

    let filesList = [];
    searchFile(wxmlProjectRoot, filesList);

    for (const filePath of filesList) {
        const inputFilePath = filePath.replace(wxmlProjectRoot.replace(/\\/g, '\/'), workspaceRoot);
        const content = fs.readFileSync(filePath, 'utf-8');
        const result = compileWXSS(content, filePath);
        const outputFilePath = inputFilePath.replace(".wxss", '.wxss.json');
        fs.ensureDirSync(path.dirname(outputFilePath));
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 4));
    }
}




export function compileWXSS(rawText: string, filePath: string = "") {

    text = rawText.split('\r\n');
    _filePath = filePath;

    const standardText = wxssConverter(rawText, {});
    const lexer = new WXSSLexer(standardText);
    const tokens = lexer.analysis();
    // fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 4));
    const generator = new Generator(tokens, _filePath);
    const collections = generator.generate();
    return collections;
}


function searchFile(_path: string, filesList: string[]) {
    const files = fs.readdirSync(_path); // 需要用到同步读取
    files.forEach((file) => {

        const states = fs.statSync(_path + '/' + file);
        // ❤❤❤ 判断是否是目录，是就继续递归
        if (states.isDirectory()) {
            if (file == 'node_modules' ||
                file == '.git') {
                return;
            }
            searchFile(_path + '/' + file, filesList);
        } else {
            // 不是就将文件push进数组
            const arr = file.split('.');
            if (['wxss'].includes(arr[arr.length - 1])) {
                filesList.push(_path + '/' + file);
            }
        }
    });
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