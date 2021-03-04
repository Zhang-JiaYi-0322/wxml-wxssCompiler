const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { WXSSLexer } = require('../../out/Lexer/Lexer');
const { wxssConverter } = require("@espkg/mina2vue");

// 测试生成 tokens
describe('wxssCompiler - Lexer', () => {
    const base = path.join(__dirname, 'lib');
    const dirs = fs.readdirSync(base);
    for (const dir of dirs) {
        it(`wxssCompiler - Lexer - ${dir}`, () => {
            process.chdir(path.join(base, dir));
            const content = fs.readFileSync('input.wxss', 'utf-8');
            const standardText = wxssConverter(content, {});
            const rawExpect = fs.readFileSync('expect.json', 'utf-8');

            const lexer = new WXSSLexer(standardText);
            const tokens = lexer.analysis();

            const expectResult = JSON.parse(rawExpect);

            assert.deepStrictEqual({ tokens }, expectResult);
        })
    }
})