import { error } from '..';
import * as Defination from './WordDefination';

export class WXSSLexer {

    private textArr: string[] = [];
    private tokens: { type: number, value: string, start: number, line: number }[] = [];

    private line = 0;
    private passed = -1;
    private closed = true;

    constructor(rawText: string) {
        this.textArr = (rawText).split("");
    }

    public analysis() {

        while (this.textArr.length > 0) {
            const char = this.getChar(1);

            // 跳过注释
            if (char + this.viewChar(1) == '/*') {
                while (this.viewChar(2) != '*/') {
                    this.getChar(1);
                }
                this.getChar(2);
                continue;
            }

            // 跳过空白符
            if (Defination.Space.includes(char)) {
                if (char == '\n') {
                    this.line++;
                    this.passed = -1;
                }
                continue;
            }
            // else if (Defination.Space.includes(char + this.viewChar(1))) {
            //     if (char == '\n') {
            //         this.line++;
            //         this.passed = -1;
            //     }
            //     this.getChar(1);
            //     continue;
            // }


            // 导入
            if (Defination.ImportMark == char + this.viewChar(6)) {
                this.searchImport(char + this.getChar(6));
                continue;
            }

            // 选择器
            if (Defination.Selector.includes(char) ||
                Defination.IdentifierChar.includes(char)) {
                this.textArr.unshift(char);
                this._searchSelector();
                continue;
            }



            // if (Defination.IdentifierChar.includes(char)) {
            //     this.textArr.unshift(char);
            //     this.passed--;
            //     this.searchIdentifier();
            //     continue;
            // }

            // console.log(char)
            this.sendError(`unexpected char: \`${char}\``, this.passed);
        }
        if (!this.closed) {
            this.sendError(`expect char: \`}\``, this.passed);
        }

        return this.tokens;
    }

    private _searchSelector(): void {
        let childBuffer = [];
        let start = -1;
        let line = -1;
        let isPosition = false;
        while (this.textArr.length > 0 && this.viewChar(1) != '{') {
            const char = this.getChar(1);
            // . #
            if (Defination.Selector.includes(char)) {
                this.pushToken(Defination.CharacterType.Selector, char, this.line, this.passed);
            }
            // ::
            else if (Defination.MiddleSelector.includes(char + this.viewChar(1))) {
                this.pushToken(Defination.CharacterType.Identifier, childBuffer.join("").trim(), line, start);
                childBuffer = [];
                start = -1;
                line = -1;
                this.pushToken(Defination.CharacterType.MiddleSelector, char + this.getChar(1), this.line, this.passed - 1);
                isPosition = true;
            }
            // :
            else if (Defination.MiddleSelector.includes(char)) {
                this.pushToken(Defination.CharacterType.Identifier, childBuffer.join("").trim(), line, start);
                childBuffer = [];
                start = -1;
                line = -1;
                this.pushToken(Defination.CharacterType.MiddleSelector, char, this.line, this.passed);
                isPosition = true;
            }
            // ,
            else if (Defination.Break == char) {
                this.pushToken(isPosition ? Defination.CharacterType.Position : Defination.CharacterType.Identifier, childBuffer.join("").trim(), line, start);
                if (isPosition) isPosition = false;
                childBuffer = [];
                start = -1;
                line = -1;
                this.pushToken(Defination.CharacterType.Break, char, this.line, this.passed);
            }
            else if (Defination.IdentifierChar.includes(char)) {
                if (start == -1) {
                    start = this.passed;
                    line = this.line;
                }
                childBuffer.push(char);
            }
            else if (Defination.Space.includes(char)) {
                if (char == '\n') {
                    this.line++;
                    this.passed = -1;
                }
                if (start == -1) {
                    start = this.passed;
                    line = this.line;
                }
                childBuffer.push(char);
                // if (char == '\n') {
                //     this.line++;
                //     this.passed = -1;
                // }
                // continue;
            }
            else {
                this.sendError(`unexpected char: \`${char}\``, this.passed);
            }
        }
        if (this.textArr.length == 0) {
            this.sendError(`expect char: \`{\``, this.passed);
        }
        if (this.viewChar(1) == '{') {
            if (!this.closed) {
                this.sendError(`expect char: \`}\``, this.passed);
            }
            this.pushToken(isPosition ? Defination.CharacterType.Position : Defination.CharacterType.Identifier, childBuffer.join("").trim(), line, start);
            this.pushToken(Defination.CharacterType.Delimiter, this.getChar(1), this.line, this.passed);
            this.closed = false;
            this.searchProperty();
            if (!this.closed && this.textArr.length == 0) {
                this.sendError(`expect char: \`}\``, this.passed);
            }
        }
    }

    // 处理选择器和对象名
    private searchSelector(char: string): void {
        this.pushToken(Defination.CharacterType.Selector, char, this.line, this.passed);
        this.searchIdentifier();
    }

    // 处理对象名
    private searchIdentifier(): void {
        let childBuffer = [];
        let start = -1;
        let line = -1;
        while (this.textArr.length > 0 && this.viewChar(1) != '{') {
            const _char = this.getChar(1);
            // ::
            if (Defination.MiddleSelector.includes(_char + this.viewChar(1))) {
                this.pushToken(Defination.CharacterType.Identifier, childBuffer.join(""), line, start);
                childBuffer = [];
                start = -1;
                line = -1;
                this.pushToken(Defination.CharacterType.MiddleSelector, _char + this.getChar(1), this.line, this.passed - 1);
            }
            else if (Defination.MiddleSelector.includes(_char)) {
                this.pushToken(Defination.CharacterType.Identifier, childBuffer.join(""), line, start);
                childBuffer = [];
                start = -1;
                line = -1;
                this.pushToken(Defination.CharacterType.MiddleSelector, _char, this.line, this.passed);
            }
            else if (Defination.IdentifierChar.includes(_char)) {
                if (start == -1) {
                    start = this.passed;
                    line = this.line;
                }
                childBuffer.push(_char);
            }
            else if (Defination.Space.includes(_char)) {
                if (_char == '\n') {
                    this.line++;
                    this.passed = -1;
                }
                continue;
            }
            else {
                this.sendError(`unexpected char: \`${_char}\``, this.passed);
            }
        }
        if (this.textArr.length == 0) {
            this.sendError(`expect char: \`{\``, this.passed);
        }
        if (this.viewChar(1) == '{') {
            if (!this.closed) {
                this.sendError(`expect char: \`}\``, this.passed);
            }
            this.pushToken(Defination.CharacterType.Identifier, childBuffer.join(""), line, start);
            this.pushToken(Defination.CharacterType.Delimiter, this.getChar(1), this.line, this.passed);
            this.closed = false;
            this.searchProperty();
            if (!this.closed && this.textArr.length == 0) {
                this.sendError(`expect char: \`}\``, this.passed);
            }
        }
    }

    // 处理对象属性
    private searchProperty(): void {
        let hasKey = null;
        let buffer = [];
        let start = -1;
        let line = -1;
        let isString = false;
        while (this.textArr.length > 0 && this.viewChar(1) != '}') {
            const _char = this.getChar(1);
            if (_char + this.viewChar(1) == '/*') {
                this.getChar(1);
                while (this.viewChar(2) !== '*/') {
                    this.getChar(1);
                }
                this.getChar(2);
                if (this.textArr.length < 1) {
                    this.sendError('unexpected end', this.passed);
                }
            }
            // 冒号：存入缓存的 key
            else if (!isString && Defination.PropertyOperator == _char) {
                this.pushToken(Defination.CharacterType.Key, buffer.join("").trim(), line, start);
                buffer = [];
                start = -1;
                line = -1;
                hasKey = this.tokens[this.tokens.length - 1];
                this.pushToken(Defination.CharacterType.PropertyOperator, ':', this.line, this.passed);
            }
            // 界符
            else if (/*!isString &&*/ Defination.Delimiter.includes(_char)) {
                if (_char == ';') {
                    if (hasKey && (this.checkNext() != '\n' && this.checkNext() != '}')) {
                        if (start == -1) {
                            line = this.line
                            start = this.passed;
                        }
                        buffer.push(_char);

                    }
                    else if (hasKey) {
                        if (buffer.length > 0) {
                            this.pushToken(Defination.CharacterType.Value, buffer.join("").trim(), line, start);
                            buffer = [];
                            start = -1;
                            line = -1;
                            isString = false;
                        }
                        else {
                            this.sendError(`key need a value: \`${hasKey.value}\``, this.passed);
                        }
                        hasKey = null;
                    }
                    else {
                        this.sendError(`unexpected char: \`${_char}\``, this.passed);
                    }
                }
                else {
                    this.sendError(`unexpected char: \`${_char}\``, this.passed);
                }
            }
            else if (Defination.Space.includes(_char) && _char != " ") {
                if (_char == '\n') {
                    this.line++;
                    this.passed = -1;
                }
                continue;
            }
            // 其他的都认为是 key 或 value，缓存
            else {
                if (_char == '"') {
                    if (isString) isString = false;
                    else isString = true;
                }
                // todo
                else if (_char + this.viewChar(3) == 'url(') {
                    isString = true;
                }
                if (start == -1) {
                    line = this.line
                    start = this.passed;
                }
                buffer.push(_char);
            }
        }
        if (this.textArr.length == 0) {
            this.sendError(`expect char: \`}\``, this.passed);
        }
        if (this.viewChar(1) == '}') {
            this.tokens.push({
                type: Defination.CharacterType.Delimiter,
                value: this.getChar(1),
                line: this.line,
                start: this.passed
            });
            this.closed = true;
        }
    }

    // 处理 import
    private searchImport(char: string): void {
        this.pushToken(Defination.CharacterType.Import, char, this.line, this.passed - 6);
        let hasPath = false;
        let start = -1;
        let line = -1;
        while (this.textArr.length > 0) {
            const _char = this.getChar(1);
            // 跳过空白符
            if (Defination.Space.includes(_char)) {
                if (_char == '\n') {
                    this.line++;
                    this.passed = -1;
                }
                continue;
            }
            // 从引号开始获取值
            if (_char == '"' && !hasPath) {
                let path = "";
                let stringClosed = false;
                while (this.textArr.length > 0) {
                    const _char2 = this.getChar(1);
                    if (_char2 == '"') {
                        stringClosed = true;
                        break;
                    }
                    if (start == -1) {
                        start = this.passed;
                        line = this.line;
                    }
                    path += _char2;
                }
                if (!stringClosed) {
                    this.sendError(`expect char: \`"\``, this.passed);
                }
                if (this.textArr.length == 0) {
                    this.sendError(`expect char: \`;\``, this.passed);
                }
                this.pushToken(Defination.CharacterType.Path, path.trim(), line, start);
                hasPath = true;
                continue;
            }
            if (_char == ';') {
                if (hasPath)
                    break;
                else
                    this.sendError(`@import need a path`, this.passed);
            }
            this.sendError(`unexpected char: \`${_char}\``, this.passed);
        }
    }

    private getChar(length: number): string {
        if (this.textArr.length < length) {
            const result = this.textArr.join("");
            this.passed += this.textArr.length;
            this.textArr = [];
            return result;
        }
        let result = "";
        for (let i = 0; i < length; i++) {
            result += this.textArr.shift();
        }
        this.passed += length;
        return result;
    }

    private viewChar(length: number): string {
        if (this.textArr.length < length) {
            const result = this.textArr.join("");
            return result;
        }
        let result = "";
        for (let i = 0; i < length; i++) {
            result += this.textArr[i];
        }
        return result;
    }

    private pushToken(type: number, value: string, line: number, start: number): void {
        this.tokens.push({
            type,
            value,
            line,
            start
        });
    }

    private sendError(message: string, passed: number): void {
        error(message, this.line, passed);
        // throw (message)
    }

    private checkNext(): string {
        let char = this.viewChar(1);
        while (char == ' ' || char == '\r') {
            this.getChar(1);
            char = this.viewChar(1);
        }
        return char;
    }
}