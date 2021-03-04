const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { parser } = require('../../out/parser/parser');
const { AstGenerator } = require('../../out/parser/AstGenerator/Generator');
const { generate } = require('astring');
const acorn = require('acorn');

// 测试生成 ast
describe('Parser - Error', () => {
    const base = path.join(__dirname, 'lib');
    const dirs = fs.readdirSync(base);
    for (const dir of dirs) {
        it(`parser - Error - ${dir}`, () => {
            process.chdir(path.join(base, dir));
            const content = fs.readFileSync('input.nex', 'utf-8');
            const expect = fs.readFileSync('expect.log', 'utf-8');
            try {
                parser(content, path.join(dir, 'input.nex'));
            }
            catch (e) {
                assert.deepStrictEqual(e.replace(/\r\n/g, '\n').trim(), expect.replace(/\r\n/g, '\n').trim());
            }
        })
    }
})