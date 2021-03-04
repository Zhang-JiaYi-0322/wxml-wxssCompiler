import { wxssConverter } from "@espkg/mina2vue";
import fs from "fs";
import { WXSSLexer } from './Lexer/Lexer';
import { Generator } from './Generator/Generator';
import { compileWXSS } from ".";

const url = "./lib/index.wxss"
const text = fs.readFileSync(url, 'utf-8');
const standardText = wxssConverter(text, {});
// const lexer = new WXSSLexer(standardText);
// const tokens = lexer.analysis();
// fs.writeFileSync("./lib/tokens.json", JSON.stringify({ tokens }, null, 4), 'utf-8');
// const generator = new Generator(tokens);
// const collections = generator.generate();
// fs.writeFileSync("./lib/collections.json", JSON.stringify(collections, null, 4), 'utf-8');
// compileWXSS(text, "./lib/index.wxss");
const collections = compileWXSS(standardText, url);
fs.writeFileSync("./lib/collections.json", JSON.stringify(collections, null, 4), 'utf-8');