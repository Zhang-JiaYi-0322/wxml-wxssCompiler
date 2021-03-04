const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { parser } = require('../../out/parser/parser');
const { AstGenerator } = require('../../out/parser/AstGenerator/Generator');
const { generate } = require('astring');

// 测试生成 ast
describe('Parser - Generator', () => {
    const base = path.join(__dirname, 'lib');
    const dirs = fs.readdirSync(base);
    for (const dir of dirs) {
        it(`parser - Lexer - ${dir}`, () => {
            process.chdir(path.join(base, dir));
            const content = fs.readFileSync('input.nex', 'utf-8');
            const rawExpect = fs.readFileSync('expect.js', 'utf-8').split("\r\n").join("\n")
            const result = parser(content).code;
            // assert.deepStrictEqual(result,
            //     generate(acorn.parse(rawExpect, { ecmaVersion: 2020 })));
            assert.deepStrictEqual(result, rawExpect);
        })
    }
})