// 词法分析器

import { Token } from "../SyntacticParser/TypeDefination";
import {
    CharacterType, Delimiter, Operator, ReserverdWord, IdentifierChar, Space,
    OpenDelimiter, CloseDelimiter, DelimiterMatcher, Label
} from "./Defination";
import { error } from '../parser';

const NOTFOUND = "notFound";

export class NexLexer {

    private textArr: string[] = [];
    private tokens: { type: number, value: string, line: number, start: number, end: number }[] = [];
    private index: number = 0;
    // private contentBuffer: string[] = [];
    private stack: string[] = [];
    private charBuffer = "";
    private charStart = -1;

    private line = 0;
    private passed = 0;
    private inDelimiter = false;

    constructor(rawText: string) {
        // console.log(rawText.split(""))
        this.textArr = (rawText + " ").split("");
    }

    public analysis(): Array<any> {
        this.charBuffer = "";
        while (this.index < this.textArr.length) {
            // console.log(this.tokens[this.tokens.length-1])
            const char = this.getChar(this.index, 1, false);
            // 跳过注释
            if (this.getChar(this.index, 4, false) == "<!--") {
                while (this.getChar(this.index, 3, false) != "-->") {
                    this.index++;
                }
                this.index += 3;
                continue;
            }

            // 跳过空白符
            if (this.viewPop("") != "\"" &&
                this.charBuffer.length == 0) {
                if (Space.includes(char)) {
                    if (char == '\r' && this.getChar(this.index + 1) == '\n') {
                        this.line++;
                        this.passed = this.index + 2; // \r\n
                    }
                    this.index++;
                    if (this.index >= this.textArr.length) {
                        break;
                    }
                    continue;
                }
                else if (Space.includes(this.getChar(this.index, 2, false))) {
                    this.index += 2;
                    if (this.index >= this.textArr.length) {
                        break;
                    }
                    continue;
                }
            }

            // 处理界符：存入tokens的同时单独入栈
            if (this.searchDelimiter(char)) {
                continue;
            }

            //识别运算符
            // 不在 引号 中且在 Operator 中的符号识别为运算符
            if (this.searchOperator(char)) {
                continue;
            }

            // 识别标识符，栈顶不为 " 的情况下
            if (this.searchIdentifier(char)) {
                continue;
            }

            // 在 "" 中的内容识别为字符串，在 {{}} 中的内容除外
            // 栈空的情况下内容识别为字符串
            if (this.searchWord(char)) {
                continue;
            }
            // console.log(6)
            this.printError(`unexpected character, near \`${this.getChar(this.index, 5, false)}\``, this.index - this.passed);
        }

        if (this.stack.length > 0) {
            // t his.sendError("Delimiters are not matched!")
        }
        // console.log(this.tokens)
        return this.tokens;
    }

    private searchDelimiter(char: string): boolean {
        // 区分单字符和双字符：单字符情况
        if (Delimiter.includes(char) &&
            !Delimiter.includes(this.getChar(this.index, 2, false))) {
            // 跳过 innerText
            if (this.stack.length == 0) {
                if (['[', ']', '(', ')', ',', '"'].includes(char)) {
                    return false;
                }
            }

            // 判断该字符是否是 "{{}}" 中的运算符
            // 该判断只在单字符情况下存在
            if (this.stack.includes("{{") &&
                Operator.includes(char)) {
                if (this.searchOperator(char)) {
                    return true;
                }
            }

            // 存入缓存的字符串
            if ((char == "\"" || char == "<" || char == "(") && this.charBuffer != "") {
                const arr = this.charBuffer.trim().split("\r\n");
                let _length = 0;
                for (let child of arr) {
                    let type = CharacterType.Word;
                    if (!isNaN(Number(child.trim()))) {
                        type = CharacterType.Number;
                    }
                    this.pushToken(type, child/*.trim()*/, this.charStart + _length);
                    _length += child.length;
                }
                this.charBuffer = "";
                this.charStart = -1;
            }
            // 打开区间
            if (OpenDelimiter.includes(char) &&
                this.viewPop("") != char) {
                if (this.stack.includes(char)) {
                    // console.log(1)
                    this.printError(`unexpected character \`${char}\``, this.index - this.passed);
                }
                else if (this.stack.length > 0 && ['<', '</'].includes(this.stack[this.stack.length - 1]) &&
                    this.tokens[this.tokens.length - 1].value != '=') {
                    // console.log(2)
                    this.printError(`unexpected character \`${char}\``, this.index - this.passed);
                }
                this.stack.push(char);
                this.pushToken(CharacterType.Delimiters, char, this.index);
            }
            else if (OpenDelimiter.includes(char) &&
                this.viewPop("") == char &&
                char != "\"") {
                if (!(this.stack.includes("\"") || this.stack.includes('{{'))) {
                    // console.log(7)
                    console.log(this.tokens);
                    this.printError(`unexpected character \`${char}\``, this.index - this.passed);
                }
                else if (this.stack.includes("{{")) {
                    this.stack.push(char);
                    this.pushToken(CharacterType.Delimiters, char, this.index);
                }
                else {
                    this.printError("" + char, this.index - this.passed);
                }
            }
            // 闭合区间
            else {
                if (DelimiterMatcher[char] == this.viewPop("") ||
                    DelimiterMatcher[char + '1'] == this.viewPop("")) {
                    this.stack.pop();
                    this.pushToken(CharacterType.Delimiters, char, this.index);
                }
                else if (char == ',') {
                    this.pushToken(CharacterType.Delimiters, char, this.index);
                }
                else {
                    // console.log(this.tokens);
                    // t his.sendError("error: " + char);
                    if (this.stack.length == 0) {
                        if (isNaN(Number(char)))
                            this.pushToken(CharacterType.Word, char, this.index);
                        else
                            this.pushToken(CharacterType.Number, char, this.index);
                    }
                    else {
                        this.printError(`unexpected character \`${char}\``, this.index - this.passed);
                    }
                }
            }
            this.index++;
            return true;
        }
        // 区分单字符和双字符：双字符情况
        else if (/*Delimiter.includes(char) &&*/
            Delimiter.includes(this.getChar(this.index, 2, false))) {
            const _char = this.getChar(this.index, 2, false);
            // 存入缓存的字符串
            if ((char == "\"" || char == "<" || _char == "{{") && this.charBuffer != "") {
                const arr = this.charBuffer.trim().split("\r\n");
                let _length = 0;
                for (let child of arr) {
                    let type = CharacterType.Word;
                    if (!isNaN(Number(child.trim()))) {
                        type = CharacterType.Number;
                    }
                    this.pushToken(type, child/*.trim()*/, this.charStart + _length);
                    _length += child.length;
                }
                this.charBuffer = "";
                this.charStart = -1;
            }
            // 打开区间
            if (OpenDelimiter.includes(_char)) {
                if (this.stack.includes(_char)) {
                    // console.log(3)
                    this.printError(`unexpected character \`${_char}\``, this.index - this.passed);
                }
                else if (this.stack.length > 0 && ['<', '</'].includes(this.stack[this.stack.length - 1]) &&
                    this.tokens[this.tokens.length - 1].value != '=') {
                    // console.log(4)
                    this.printError(`unexpected character \`${_char}\``, this.index - this.passed);
                }

                if (_char == '{{') this.inDelimiter = true;
                this.pushToken(CharacterType.Delimiters, _char, this.index);
                this.stack.push(_char);
            }
            // else if (OpenDelimiter.includes(_char) &&
            //     this.viewPop("") == _char) {
            //     if (!this.stack.includes("\"")) {
            //         // console.log(8)
            //         console.log(this.tokens);
            //         this.printError(`unexpected character \`${_char}\``, this.index - this.passed);
            //     }
            //     else if (this.stack.includes("{{")) {
            //         this.stack.push(_char);
            //         this.pushToken(CharacterType.Delimiters, _char, this.index);
            //     }
            //     else {
            //         this.printError("" + _char, this.index - this.passed);
            //     }
            // }
            // 闭合区间
            else {
                if (DelimiterMatcher[_char] == this.viewPop("")) {
                    this.stack.pop();
                    if (_char == '}}') this.inDelimiter = false;
                    this.pushToken(CharacterType.Delimiters, _char, this.index);
                }
                else {
                    // console.log(this.tokens);
                    // t his.sendError("error: " + _char);
                    if (this.stack.length == 0) {
                        if (isNaN(Number(_char)))
                            this.pushToken(CharacterType.Word, _char, this.index);
                        else
                            this.pushToken(CharacterType.Number, _char, this.index);
                    }
                    else {
                        this.printError(`unexpected character \`${_char}\``, this.index - this.passed);
                    }
                }
            }
            this.index += 2;
            return true;
        }
        else {
            return false;
        }
    }

    private searchOperator(char: string): boolean {
        // 考虑 = 在 {{}} 外面的情况
        if ((this.viewPop("(") == "{{" || this.viewPop("(") == "[" || (this.viewPop("(") == "<" && [':', '='].includes(char))) &&
            Operator.includes(this.getChar(this.index, 2, false))) {
            this.pushToken(CharacterType.Operator, this.getChar(this.index, 2, false), this.index);
            this.index += 2;
            return true;
        }
        else if ((this.viewPop("(") == "{{" || this.viewPop("(") == "[" || (this.viewPop("(") == "<" && [':', '='].includes(char))) &&
            Operator.includes(this.getChar(this.index, 3, false))) {
            this.pushToken(CharacterType.Operator, this.getChar(this.index, 3, false), this.index);
            this.index += 3;
            return true;
        }
        else if ((this.viewPop("(") == "{{" || this.viewPop("(") == "[" || (this.viewPop("(") == "<" && [':', '='].includes(char))) &&
            Operator.includes(char)) {
            this.pushToken(CharacterType.Operator, char, this.index);
            this.index++;
            return true;
        }
        else {
            return false;
        }
    }

    private searchIdentifier(char: string): boolean {
        if (this.stack.length > 0 && this.viewPop("") != "\"" &&
            IdentifierChar.includes(char)) {
            const index = this.index;
            let _char = char;
            this.index++;
            while (IdentifierChar.includes(this.textArr[this.index]) || (!this.inDelimiter && this.textArr[this.index] == '-')) {
                if (this.textArr[this.index] == '-')
                    _char += '_';
                else
                    _char += this.textArr[this.index];
                this.index++;
            }
            let type = CharacterType.Identifier;
            // 针对数字（尤其是带有小数）的情况
            if (!isNaN(Number(_char))) {
                type = CharacterType.Number;
                if (this.tokens.length >= 2 &&
                    this.tokens[this.tokens.length - 1].value == '.' &&
                    this.tokens[this.tokens.length - 2].type == CharacterType.Number) {
                    _char = this.tokens[this.tokens.length - 2].value +
                        this.tokens[this.tokens.length - 1].value +
                        _char;
                    this.tokens.pop();
                    this.tokens.pop();
                }
            }
            // 针对保留字
            else if (ReserverdWord.includes(_char)) {
                type = CharacterType.ReservedWord;
            }
            // 针对组件名
            // else if (Label.includes(_char)) {
            //     type = CharacterType.Label
            // }
            if (type == CharacterType.Identifier) {
                var p = /[a-z]/i;
                if (!p.test(_char[0])) {
                    this.printError('Bad value: ' + _char, index - this.passed);
                }
            }
            this.pushToken(type, _char, index);
            return true;
        }
        return false;
    }

    private searchWord(char: string): boolean {
        if (this.viewPop("") == "\"" || this.stack.length == 0) {
            if (this.charStart == -1) this.charStart = this.index;
            this.charBuffer += char;
            this.index++;
            return true;
        }
        return false;
    }





    private getChar(index: number, length: number = 1, sendError: boolean = true): string {
        if ((index + length - 1) >= this.textArr.length) {
            if (sendError) {
                // console.log(this.tokens)
                console.log(index, '  ', length)
                console.log(this.textArr.length)
                this.sendError("(index + length - 1) out of range: " + (index + length - 1));
            }
            else {
                length = this.textArr.length - index;
            }
        }

        let text = this.textArr[index];
        let _index = index;
        while (_index < (index + length - 1)) {
            text += this.textArr[++_index];
        }
        return text;

    }

    // 不删除的情况下返回栈顶元素，遇到指定参数时会跳过栈中该元素
    private viewPop(excp: string): string {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            if (this.stack[i] != excp) {
                return this.stack[i];
            }
        }
        return NOTFOUND;
    }

    private pushToken(type: number, value: string, index: number): void {
        const start = index - this.passed;
        const end = start + value.length;
        this.tokens.push({
            type,
            value,
            line: this.line,
            start,
            end
        });
    }

    private sendError(message: string): void {
        throw ("Lexer Error: " + message);
    }

    private printError(message: string, index: number): void {
        // console.log(123)
        error("Lexer Error: " + message, this.line, index);
    }
}

