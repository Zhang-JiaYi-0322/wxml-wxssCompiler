const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { parser } = require('../../out/parser/parser');
const { NexLexer } = require('../../out/parser/Lexer/Lexer');
const { SyntacticParser } = require('../../out/parser/SyntacticParser/SyntacticParser');


// 测试生成 tokens
describe('Parser - Lexer', () => {
    const base = path.join(__dirname, 'lib');
    const dirs = fs.readdirSync(base);
    for (const dir of dirs) {
        it(`parser - Lexer - ${dir}`, () => {
            process.chdir(path.join(base, dir));
            const content = fs.readFileSync('input.nex', 'utf-8');
            const rawExpect = fs.readFileSync('tree.json', 'utf-8');

            const lexer = new NexLexer(content);
            const tokens = lexer.analysis();
            const parer = new SyntacticParser(tokens);
            const tree = parer.parseAST();

            const expectResult = JSON.parse(rawExpect);

            assert.deepStrictEqual(JSON.parse(JSON.stringify(tree, null, 4)), expectResult);
        })
    }
})