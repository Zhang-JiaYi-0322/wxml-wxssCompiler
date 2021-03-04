import { compileWXSS, error } from '..';
import * as Defination from '../Lexer/WordDefination';
import fs from 'fs';
import path from 'path';

export class Generator {

    private tokens: { type: number, value: string, start: number, line: number }[] = [];
    private _collections = [];
    private _import = [];
    private filePath = '';

    constructor(tokens: { type: number, value: string, start: number, line: number }[], filePath: string = "") {
        this.tokens = tokens;
        this.filePath = filePath;
    }

    public generate() {
        while (this.tokens.length > 0) {
            const token = this.viewToken();

            // @import
            if (token.type == Defination.CharacterType.Import) {
                this.getToken();
                this._parseImport();
                continue;
            }

            // identifier
            if (token.type == Defination.CharacterType.Identifier ||
                token.type == Defination.CharacterType.Selector) {
                this._parseIdentifier();
                continue;
            }

            this.sendError(`unexpected word: \`${token.value}\``, token);
        }
        for (const child of this._import) {
            const result = this.importTemplate(child);
            result.map(item => {
                this._collections.push(item);
            })
        }
        return this._collections;
    }

    private _parseImport(): void {
        const path = this.getToken();
        if (path.type != Defination.CharacterType.Path) {
            this.sendError('expect path after `@import`', path);
        }
        this._import.push(path.value);
    }

    private _parseIdentifier(): void {
        let result = { element: [], style: {} };
        let helper = false;
        while (this.tokens.length > 0) {
            const token = this.getToken();
            if (token.type == Defination.CharacterType.Identifier) {
                if (this.viewToken().type == Defination.CharacterType.Break ||
                    this.viewToken().value == '{') {
                    const name = token.value[0].toUpperCase() + token.value.slice(1);
                    result.element.push({ type: 'label', name });
                }
                else if (this.viewToken().type == Defination.CharacterType.MiddleSelector) {
                    this.getToken();
                    const next = this.getToken();
                    result.element.push({
                        type: "label",
                        insert: true,
                        name: token.value[0].toUpperCase() + token.value.slice(1),
                        position: next.value
                    });
                }
                else {
                    this.sendError(`unexpected word: \`${token.value}\``, token);
                }
            }
            else if (token.type == Defination.CharacterType.Selector) {
                const next = this.getToken();
                let insert = false;
                let type = token.value == '#' ? 'id' : 'class'
                if (token.value == '@') {
                    type = 'else';
                    insert = true;
                }
                result.element.push({
                    type,
                    insert,
                    name: next.value
                });
                helper = true;
            }

            if (this.viewToken().type == Defination.CharacterType.MiddleSelector &&
                helper) {
                helper = false;
                this.getToken();
                const obj = result.element.pop();
                obj.insert = true;
                obj['position'] = this.getToken().value;
                result.element.push(obj);
            }

            if (this.viewToken().type == Defination.CharacterType.Break) {
                this.getToken();
                continue;
            }
            else if (this.viewToken().value == '{') {
                break;
            }
            else {
                this.sendError(`unexpected word: \`${this.viewToken().value}\``, this.viewToken());
            }
        }
        result.style = this._parseProperty();
        this._collections.push(result);
    }

    private _parseProperty() {
        let style = {};
        const delimiter = this.getToken();
        if (delimiter.type != Defination.CharacterType.Delimiter ||
            delimiter.value != '{') {
            this.sendError(`unexpected word \`${delimiter.value}\``, delimiter);
        }
        while (this.viewToken().value != '}') {
            const token = this.getToken();
            if (token.type == Defination.CharacterType.Key) {
                if (this.viewToken().type == Defination.CharacterType.PropertyOperator) {
                    this.getToken();
                }
                else {
                    const word = this.getToken();
                    this.sendError(`unexpected word \`${word.value}\``, word);
                }
                const nextToken = this.getToken();
                if (nextToken.type == Defination.CharacterType.Value) {
                    style[token.value] = nextToken.value;
                }
                else {
                    this.sendError(`unexpected word \`${nextToken.value}\``, nextToken);
                }
            }
            else {
                this.sendError(`unexpected word \`${token.value}\``, token);
            }
        }
        this.getToken();
        return style;
    }

    // todo
    private importTemplate(url: string) {
        const title = path.join(__dirname, '../../../example/test')
        const filePath = path.join(title, path.join(this.filePath, url));
        // console.log(title, filePath)
        const text = fs.readFileSync(filePath, 'utf-8');
        return compileWXSS(text, url);
    }

    private getToken(): { type: number, value: string, start: number, line: number } {
        return this.tokens.shift();
    }

    private viewToken(): { type: number, value: string, start: number, line: number } {
        return this.tokens[0];
    }

    private sendError(message: string, token: { type: number, value: string, start: number, line: number }): void {
        console.log(token)
        error(message, token.line, token.start);
        // throw (message)
    }
}