import * as path from 'path';
import * as fs from 'fs-extra';
import { parser } from './parser/parser';

export function run(wxmlProjectRoot: string, workspaceRoot: string) {

    let filesList = [];
    searchFile(wxmlProjectRoot, filesList);
    for (const filePath of filesList) {
        const inputFilePath = filePath.replace(wxmlProjectRoot.replace(/\\/g, '\/'), workspaceRoot);
        const content = fs.readFileSync(filePath, 'utf-8').replace(/'/g, '"');
        const result = parser(content, filePath);
        const outputFilePath = inputFilePath.replace(".wxml", '.wxml.js');
        fs.ensureDirSync(path.dirname(outputFilePath));
        fs.writeFileSync(outputFilePath, result.code);
    }

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
            if (['wxml'].includes(arr[arr.length - 1])) {
                filesList.push(_path + '/' + file);
            }
        }
    });
}