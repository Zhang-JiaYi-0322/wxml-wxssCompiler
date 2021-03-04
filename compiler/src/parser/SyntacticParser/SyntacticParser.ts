// 语法分析器

import { CharacterType, OperatorIndex, RightOperatorIndex } from "../Lexer/Defination";
import {
    Node, Attribute, Token,
    Expression, ExpressionStatement, UnaryExpression, BinaryExpression, ConditionalExpression, MemberExpression, ArrayExpression, BlockStatement, LabeledStatement,
    Identifier, Literal, SpreadElement, ObjectExpression, Property
} from "./TypeDefination";
import { error } from '../parser';

export class SyntacticParser {

    private tokens: Token[];
    private index: number;
    // ast: any = {
    //     type: "Program",
    //     body: [],
    //     sourceType: "module"
    // };
    private tree = {
        root: []
    };
    private stack = [];
    // private blockStack = [];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.index = -1;
    }

    public parseAST() {
        this.parseTree();
        return this.tree;
    }


    // 将 token流 整理成标签树
    private parseTree(): void {
        while (this.index < this.tokens.length - 1) {
            const token = this.getToken();
            // console.log(token)
            if (token.type == CharacterType.Delimiters &&
                token.value == "<") {
                this.parseNode(this.tree.root, token);
                continue;
            }
            else {
                // console.log(token)
                const literal = new Literal(token);
                if (token.type == CharacterType.Word) {
                    literal.raw = `"${token.value}"`;
                    literal.value = token.value;
                }
                else {
                    literal.raw = token.value;
                    literal.value = Number(token.value);
                }
                this.tree.root.push(literal);
            }
        }
    }

    // 处理节点
    private parseNode(arr: Array<any>, token: Token): void {
        this.stack.push(token.value);   // push("<")
        const node = new Node();
        node.setStart(token);
        let isBeginClosed = false;
        let isEndClosed = false;

        // 处理开头 <> 部分
        while (!isBeginClosed && this.index < this.tokens.length - 1) {
            const token = this.getToken();
            // 给标签名赋值
            /*if (node.label == "" && token.type != CharacterType.Label) {
                // console.log(token)
                this.printError(`expect tag name, near \`${token.value}\``, token);
            }
            else*/ if (node.label == "") {
                node.label = token.value;
                continue;
            }
            // 处理 Attribute
            if (token.type == CharacterType.Identifier ||
                token.type == CharacterType.ReservedWord) {
                this.parseAttribute(node.attribute, token);
                continue;
            }
            // 结束一个节点
            if (token.type == CharacterType.Delimiters &&
                token.value == ">") {
                // this.stack.pop();
                // this.blockStack.push(node.label);
                isBeginClosed = true;
                break;
            }
            // <view /> 情况
            else if (token.type == CharacterType.Delimiters &&
                token.value == "/>") {
                isBeginClosed = true;
                isEndClosed = true;
                node.setEnd(token);
                // this.stack.pop();
                // this.blockStack.push(node.label);
            }

        }
        if (!isEndClosed) {
            // 处理内部内容
            this.parseContent(node.children);
            // 处理结尾 </ > 部分
            this.parseEnd(node);
        }
        // 存储
        arr.push(node);
    }

    // 处理标签内部
    private parseContent(arr: any[]): void {
        let word = '';
        let startWord = null;
        let endWord = null;
        while (!(this.viewToken().type == CharacterType.Delimiters &&
            this.viewToken().value == '</')) {
            const token = this.getToken();
            if (token.type == CharacterType.Delimiters) {
                switch (token.value) {
                    // {{}} 的情况跟处理属性相同
                    case '{{':
                        if (word.length > 0) {
                            const obj = new Literal();
                            obj.raw = '"' + word + '"';
                            obj.value = word;
                            obj.setStart(startWord);
                            obj.setEnd(endWord);
                            arr.push(obj);
                            word = "";
                            endWord = null;
                        }
                        this.parseExpression(arr);
                        break;
                    // 子标签的情况递归
                    case '<':
                        if (word.length > 0) {
                            const obj = new Literal();
                            obj.raw = '"' + word + '"';
                            obj.value = word;
                            obj.setStart(startWord);
                            obj.setEnd(endWord);
                            arr.push(obj);
                            word = "";
                            endWord = null;
                        }
                        this.parseNode(arr, token);
                        break;
                    default:
                        if (word.length == 0) {
                            startWord = token;
                        }
                        word += token.value;
                        endWord = token;
                }
            }
            // 其他情况视为文本
            else {
                if (word.length == 0) {
                    startWord = token;
                }
                word += token.value;
                endWord = token;
            }
        }
        if (word.length > 0) {
            const obj = new Literal();
            obj.raw = '"' + word + '"';
            obj.value = word;
            obj.setStart(startWord);
            obj.setEnd(endWord);
            arr.push(obj);
        }
    }

    // 处理结尾
    private parseEnd(node: Node): void {
        let token = this.getToken();
        if (!(token.type == CharacterType.Delimiters && token.value == '</')) {
            // console.log(token);
            this.printError(`end tag missing, near \`${token.value}\``, token);
        }
        token = this.getToken();
        if (!(/*token.type == CharacterType.Label &&*/ token.value == node.label)) {
            // console.log(token);
            this.printError(`expect end-tag \`${node.label}\`, near \`${token.value}\``, token);
        }
        token = this.getToken();
        if (!(token.type == CharacterType.Delimiters && token.value == '>')) {
            // console.log(token);
            this.printError(`expect character \`>\``, token);
        }
        node.setEnd(token);
    }

    // 处理属性
    private parseAttribute(arr: Array<any>, token: Token): void {
        const attribute = new Attribute();
        attribute.setStart(token);
        // 判断是否是保留字
        switch (token.type) {
            case CharacterType.Identifier:
                if (this.viewToken().value == ':') {
                    this.printError(`unexpected attribute name, near \`${this.viewToken().value}\``, this.viewToken());
                }
                attribute.key = token.value;
                break;
            case CharacterType.ReservedWord:
                attribute.lib = token.value;
                if (this.checkToken(CharacterType.Operator, ":")) {
                    const _token2 = this.getToken();
                    if (_token2.type = CharacterType.Identifier) {
                        attribute.key = _token2.value;
                    }
                    else {
                        this.printError(`unexpected attribute name, near \`${_token2.value}\``, _token2);
                    }
                }
                else {
                    this.printError(`unexpected attribute name, near \`${this.viewToken().value}\``, this.viewToken());
                }
                break;
            default:
                this.printError(`unexpected attribute name, near \`${token.value}\``, token);
        }
        // 判断属性是否有值
        if (this.checkToken(CharacterType.Operator, "=")) {
            // 判断属性值是否按要求以引号包裹
            if (this.checkToken(CharacterType.Delimiters, '"')) {
                let _token = this.getToken();
                while (!this.checkToken(CharacterType.Delimiters, '"', _token)) {
                    // 判断是否是特殊情况 {{}}
                    if (this.checkToken(CharacterType.Delimiters, "{{", _token)) {
                        if (!attribute.value)
                            attribute.value = [];
                        this.parseExpression(attribute.value, attribute.key);
                    }
                    // 不是的情况下统一识别为文本或数字
                    else {
                        if (!attribute.value) {
                            attribute.value = [];
                        }
                        const obj = new Literal(_token);
                        obj.raw = _token.value;
                        if (_token.type == CharacterType.Number) {
                            obj.value = Number(_token.value);
                        }
                        else {
                            obj.value = _token.value;
                            obj.raw = '"' + _token.value + '"';
                        }
                        attribute.value.push(obj);
                    }
                    _token = this.getToken();
                }
            }
            else {
                this.printError(`expect character \`\"\`, near \`${this.viewToken().value}\``, this.viewToken());
            }
        }
        attribute.setEnd(this.tokens[this.index]);
        arr.push(attribute);
        return;
    }

    // 处理表达式
    private parseExpression(arr: any[], key?: string): void {

        let type = "";
        const obj = new ExpressionStatement();
        obj.setStart(this.index == -1 ? this.tokens[0] : this.tokens[this.index - 1]);

        // 遍历一遍，判断 {{}} 内是哪种情况
        let index = this.index + 1;
        let onlyIdentifier = true;
        while (index < this.tokens.length && this.tokens[index].value != "}}") {
            const value = this.tokens[index].value;
            const tokenType = this.tokens[index].type;
            index++;
            // 当存在token不为标识符或者 : [ 的情况
            if (!(tokenType == CharacterType.Identifier
                || (value == '.' || value == '['))) {
                onlyIdentifier = false;
            }
            // 生成对象的情况
            if (value == ":" || value == "..." || value == ",") {
                type = 'object';
                // break;
                continue;
            }
            // 条件运算的情况
            else if (value == '?') {
                type = 'conditional';
                break;
            }
            // 数组的情况
            else if (value == '[' && this.tokens[index - 2].value == '{{') {
                type = 'array';
                break;
            }
            // 算术式的情况
            else if (type.length == 0 && (Object.keys(OperatorIndex).includes(value) ||
                value == '[')) {
                type = 'calculate';
                continue;
            }
            else {
                continue;
            }
        }
        if (onlyIdentifier && type == '') {
            type = "identifier";
        }
        // console.log(type)
        switch (type) {
            case 'object':
                // console.log('object');
                this.parseObject(obj, key);
                break;
            case 'conditional':
                // console.log('conditional');
                this.parseCondition(obj);
                // console.log(arr)
                break;
            case 'array':
                // console.log('array');
                this.parseArray(obj);
                break;
            case 'calculate':
                // console.log('calculate');
                this.parseCalculate(obj);
                break;
            case 'identifier':
                // console.log('identifier');
                this.parseIdentifier(obj);
                break;
            default:
                this.printError(`bad attr \`${key}\` `, this.tokens[index]);
        }
        obj.setEnd(obj.expression);
        arr.push(obj.expression);
    }

    // todo 不能包换数组元素
    private parseObject(exp: ExpressionStatement, key?: string): void {
        const obj = new ObjectExpression();
        obj.setStart(this.viewToken());
        let label: any = new Property();
        while (!this.checkToken(CharacterType.Delimiters, '}}')) {
            const token = this.getToken();
            if (token.type == CharacterType.Identifier) {
                if (label.key) {
                    this.printError(`bad attr \`${key}\` `, token);
                }
                label.setStart(token);
                label.key = new Identifier();
                label.key.name = token.value;
                if (label.type != 'UpdateExpression' && this.viewToken().value != ':') {
                    // label.value = label.key;
                    label = new Identifier(token);
                    label.name = token.value;
                }
                // else {
                //     label.label = new Identifier();
                //     label.label.name = token.value;
                // }
            }
            else if (token.type == CharacterType.Delimiters) {
                if (token.value != ',') {
                    // while(this.viewToken().value!=','){
                    //     this.index--;
                    // }
                    // this.index++;
                    // console.log(this.viewToken())
                    // label = this.parseCalculate(null, false);
                    this.printError(`unexpected character \`${token.value}\``, token);
                }
                // 结束一个 label 的收录，存入 obj 并更新 label
                obj.properties.push(label);
                label = new Property();
            }
            else if (token.type == CharacterType.Operator) {
                let index = this.index + 1;
                let isJump = false;
                // 存在算术表达式的情况跳转到 parseCalculate
                while (index < this.tokens.length && ![',', '}}'].includes(this.tokens[index].value)/*this.tokens[index].type != CharacterType.Delimiters*/) {
                    if (Object.keys(OperatorIndex).includes(this.tokens[index].value)) {
                        isJump = true;
                        break;
                    }
                    index++;
                }
                if (isJump) {
                    let mark = null;
                    if (token.value == '...') {
                        mark = token;
                    }
                    else {
                        this.index--;
                    }
                    label.value = this.parseCalculate(null, false);
                    if (mark) {
                        const obj = new SpreadElement();
                        obj.setStart(mark);
                        obj._setEnd(label.value);
                        obj.argument = label.value;
                        label = obj;
                    }
                    // this.index--;
                    continue;
                }
                if (token.value != ':') {
                    // ...a 的情况
                    if (token.value == '...') {
                        const nextToken = this.getToken();
                        if (nextToken.type != CharacterType.Identifier) {
                            this.printError(`bad attr \`${token.value}\` `, token);
                        }
                        label = new SpreadElement();
                        label.setStart(token);
                        label.setEnd(nextToken);
                        label.argument = new Identifier(nextToken);
                        label.argument.name = nextToken.value;
                        if (this.viewToken().value == "}}") {
                            obj.properties.push(label);
                            label = new Property();
                        }
                        continue;
                    }
                    else {
                        this.printError(`unexpected character \`${token.value}\``, token);
                    }
                }
                const nextToken = this.getToken();
                let _obj = null;
                // const _exp = new ExpressionStatement();
                // _exp.expression = new SequenceExpression();
                switch (nextToken.type) {
                    case CharacterType.Number:
                        _obj = new Literal(nextToken);
                        _obj.raw = nextToken.value;
                        _obj.value = Number(nextToken.value);
                        // _exp.expression.expression = literal;
                        // _exp.expression = literal;
                        break;
                    case CharacterType.Identifier:
                        _obj = new Identifier(nextToken);
                        _obj.name = nextToken.value;
                        // _exp.expression.expression = identifier;
                        // _exp.expression = identifier;
                        break;
                    default:
                        this.printError(`bad attr \`${key}\` `, nextToken);
                }
                label.value = _obj;
                label._setEnd(_obj);
            }
            else {
                this.printError(`bad attr \`${key}\` `, token);
            }
        }

        for (const key in label) {
            if (label[key] && ['value', 'name', 'argument'].includes(key)) {
                obj.properties.push(label);
                break;
            }
        }
        obj._setEnd(this.viewTop(obj.properties));
        exp.expression = obj;
    }

    private parseIdentifier(exp: ExpressionStatement): any {
        let obj = null;
        let index = this.index + 1;
        while (index < this.tokens.length && (this.tokens[index].type != CharacterType.Delimiters ||
            (this.tokens[index].type == CharacterType.Delimiters && this.tokens[index].value != '}}'))) {
            if (!obj && (this.tokens[index].value == "." ||
                this.tokens[index].value == "[")) {
                obj = new MemberExpression();
            }
            if (index + 1 < this.tokens.length && [CharacterType.Identifier, CharacterType.Number].includes(this.tokens[index].type) &&
                [CharacterType.Identifier, CharacterType.Number].includes(this.tokens[index + 1].type)) {
                this.printError('bad attr', this.tokens[index]);
            }
            index++;
        }
        if (!obj) {
            const token = this.getToken();
            if (token.type != CharacterType.Identifier) {
                this.printError(`unexpected character \`${token}\``, token);
            }
            obj = new Identifier(token);
        }
        else {
            const arr = [];
            // let lastId = false;
            while (this.viewToken().type != CharacterType.Delimiters ||
                (this.viewToken().type == CharacterType.Delimiters && (['[', ']'].includes(this.viewToken().value)))) {
                const token = this.getToken();
                // if (!lastId && token.type == CharacterType.Identifier) {
                //     lastId = true;
                arr.push(token);
                // }
                // else if (token.type == CharacterType.Identifier) {
                //     this.printError('bad attr');
                // }
                // else {
                //     lastId = false;
                // }
            }
            const splitToken = new Token();
            splitToken.type = CharacterType.Operator;
            splitToken.value = '.';
            let arr2 = this.splitArray(arr, splitToken);
            let target = obj;

            // 桉树状从最右侧扫描
            while (arr2.length > 0) {
                const item = arr2.pop();
                // 非调用属性（如 a[1]）的情况
                if (item.length == 1) {
                    // 写入名称
                    if (target.type == 'Identifier') {
                        target.set(item[0]);
                        target.name = item[0].value;
                    }
                    else {
                        target.setEnd(item[0]);
                        target.property = new Identifier(item[0]);
                    }
                    // 初始化 object属性
                    if (arr2.length > 1) {
                        target.object = new MemberExpression();
                        target.setStart(item[0]);
                        // target.object.computed = true;
                    }
                    else if (arr2.length > 0 && arr2[arr2.length - 1].length > 1) {
                        target.object = new MemberExpression();
                        target.setStart(item[0]);
                        // target.object.computed = true;
                    }
                    else if (arr2.length == 0) {
                        break;
                    }
                    else {
                        target.object = new Identifier();
                    }
                    target = target.object;
                    continue;
                }
                // 调用属性的情况
                else {
                    target.property = new Identifier(item[1]);
                    target.computed = true;
                    // 最后一项
                    if (arr2.length == 0) {
                        target.object = new Identifier(item[0]);
                        continue;
                    }
                    else {
                        target.object = new MemberExpression();
                        target.setStart(item[0]);
                        // target.object.computed = true;
                        target = target.object;
                        target.property = new Identifier(item[0]);
                        // 区分 object 初始化为哪种类型
                        if (arr2.length > 1 || arr2[arr2.length - 1].length > 1) {
                            target.object = new MemberExpression();
                            target.setStart(item[0]);
                            // target.object.computed = true;
                        }
                        else {
                            target.object = new Identifier();
                        }
                        target = target.object;
                        continue;
                    }
                }
            }

            obj._setStart(obj.object);
        }
        // 跳过 }}
        this.index++;
        exp.expression = obj;
    }

    private parseArray(exp: ExpressionStatement): void {
        const array = new ArrayExpression();
        array.setStart(this.tokens[this.index + 1]);
        while (this.viewToken().value != '}}') {
            const token = this.getToken();
            // console.log(token)
            if (token.type == CharacterType.Delimiters ||
                ['[', ']'].includes(token.value)) {
                if (token.value == '[') {
                    continue;
                }
                else if (token.value == ']') {
                    array.setEnd(token);
                    break;
                }
                else if (token.value == ',') {
                    continue;
                }
                else {
                    this.printError(`unexpected character \`${token.value}\``, token);
                }
            }
            else {
                // 是算术式的情况
                let index = this.index + 1;
                let isJump = false;
                while (index < this.tokens.length && (this.tokens[index].value != ',' &&
                    this.tokens[index].value != ']')) {
                    // console.log(index,this.tokens[index].value)
                    if (this.tokens[index].type == CharacterType.Operator &&
                        Object.keys(OperatorIndex).includes(this.tokens[index].value)) {
                        this.index--;
                        array.elements.push(this.parseCalculate(null));
                        isJump = true;
                        this.index--;
                        // console.log(token)
                        break;
                    }
                    else if (this.tokens[index++].value == '[') {
                        this.index--;
                        array.elements.push(this.parseCalculate(null));
                        // console.log(this.viewToken())
                        this.index--;
                        isJump = true;
                        break;
                    }
                    index++;
                }
                if (isJump) {
                    continue;
                }
                // 标识符或数字的情况
                let obj = null;
                switch (token.type) {
                    case CharacterType.Identifier:
                        obj = new Identifier(token);
                        break;
                    case CharacterType.Number:
                        obj = new Literal(token);
                        obj.raw = token.value;
                        obj.value = Number(token.value);
                        break;
                    default:
                        this.printError(`unexpected character \`${token.value}\``, token);
                }
                array.elements.push(obj);
            }
        }
        array.setEnd(this.tokens[this.index]);
        // 跳过 }}
        this.index++;
        exp.expression = array;
    }

    // 处理三言表达式中的数字
    private parseNumber(arr: any[]): void {
        const token = this.tokens.pop();
        const obj = new Literal(token);
        obj.value = Number(token.value);
        obj.raw = token.value;
        arr.push(obj);
    }

    // 不支持 += , = 等
    _stack = []; // 用来处理数组中的中括号
    private parseCalculate(exp: ExpressionStatement | any, jump: boolean = true): any {
        let numStack = [];
        let opeStack = [];
        let arr = [];
        // console.log(this.tokens)
        const start = this.index == -1 ? this.tokens[0] : this.tokens[this.index + 1];
        // 提取整个表达式
        while (!(this.viewToken().type == CharacterType.Delimiters &&
            !['(', ')', '!', '<', '>', '[', ']'].includes(this.viewToken().value))) {
            // 递归后跳过 ）
            if ([')', ']'].includes(this.viewToken().value)) {
                // if (this.viewToken().value == ']' && this._stack.length > 0) {
                //     this._stack.pop();
                //     const p = arr.pop();
                //     console.log(p)
                //     const obj = new MemberExpression();
                //     obj.property = new Literal(p);
                //     switch (p.type) {
                //         case CharacterType.Number:
                //             obj.property.value = Number(p.value);
                //             obj.property.raw = p.value;
                //             break;
                //         case CharacterType.Identifier:
                //             obj.property.value = p.value;
                //             obj.property.raw = p.value;
                //             break;
                //         default:
                //             this.printError(`unexpected character \`${p.value}\``, p);
                //     }
                //     obj.computed = true;
                //     arr.push(obj);
                // }
                this.index++;
                break;
            }
            // 正常字符加入数组
            else if (!['(', '['].includes(this.viewToken().value)) {
                let found = false;;
                if (this.viewToken().value == ']') {
                    for (const child of arr) {
                        if (child.value == '[') {
                            found = true;
                        }
                    }
                    if (found) {
                        arr.push(this.getToken());
                    }
                    else {
                        break;
                    }
                }

                arr.push(this.getToken());
            }
            // 括号内的递归
            else {
                let edit = false;
                if (this.viewToken().value == '[') {
                    this._stack.push('[');
                    edit = true;
                }
                this.index++;
                let _obj = null;
                _obj = this.parseCalculate(_obj, jump);
                // console.log(_obj)
                if (edit) {
                    const id = arr.pop()
                    if (_obj.type === 'MemberExpression') {
                        _obj.object = new Identifier(id);
                        _obj.object.name = id.value;
                    }
                    else {
                        const member = new MemberExpression();
                        member.object = new Identifier(id);
                        member.object.name = id.value;
                        member.property = _obj;
                        _obj = member;
                    }
                }
                // console.log(_obj)
                arr.push(_obj);
            }

            if (this.index >= this.tokens.length - 1) {
                break;
            }
        }

        let end = this.tokens[this.index];
        if ([')'].includes(end.value)) {
            // "({{a}})" 情况下需要保证之后能取到 )
            this.index--;
            end = this.tokens[this.index - 1];
        }

        // console.log(arr)
        while (arr.length > 0) {
            const token = arr.shift();
            // 操作数（包换Expression的情况）
            if (this.isOperand(token)) {
                let _obj = null;
                switch (token.type) {
                    case CharacterType.Number:
                        _obj = new Literal(token);
                        _obj.raw = token.value;
                        _obj.value = Number(token.value);
                        break;
                    case CharacterType.Identifier:
                        _obj = new Identifier(token);
                        _obj.name = token.value;
                        break;
                    default:
                        _obj = token;
                }
                numStack.push(_obj);
            }
            // 运算符
            else if (this.isOperator(token)) {
                if (opeStack.length == 0) {
                    opeStack.push(token.value);
                }
                else {
                    if (RightOperatorIndex[token.value] > OperatorIndex[opeStack[opeStack.length - 1]]) {
                        opeStack.push(token.value);
                    }
                    else {
                        // ! 是单目运算符
                        if (token.value == '!') {
                            // 首先要看下一个 token 是不是操作数
                            if (this.isOperand(arr[0])) {
                                const _obj = new UnaryExpression();
                                _obj.operator = token.value;
                                _obj.argument = numStack.pop();
                                _obj.prefix = true;
                                numStack.push(_obj);
                            }
                            else if (this.isOperateDelimiter(arr[0])) {
                                opeStack.push(token.value);
                            }
                            else {
                                this.printError(`unexpected character \`${token.value}\``, token);
                            }
                        }
                        else if (token.value == '.') {
                            const _obj = new MemberExpression();
                            _obj.computed = false;
                            _obj.object = numStack.pop();
                            if (arr[0].type == CharacterType.Identifier) {
                                const _token = arr.shift()
                                _obj.property = new Identifier(_token);
                                _obj.property.name = _token.value;
                                _obj.property.binding = false;
                                numStack.push(_obj);
                            }
                            else {
                                this.printError(`unexpected character \`${arr[0].value}\``, arr[0]);
                            }
                        }
                        else {
                            if (this.isOperand(arr[0])) {
                                let _obj = null;
                                if (opeStack[opeStack.length - 1] == '!') {
                                    _obj = new UnaryExpression();
                                    _obj.right = numStack.pop();
                                    _obj.prefix = true;
                                }
                                else if (opeStack[opeStack.length - 1] == '.') {
                                    _obj = new MemberExpression();
                                    _obj.property = numStack.pop();
                                    _obj.object = numStack.pop();
                                    opeStack.pop();
                                    _obj.computed = false;
                                }
                                else {
                                    _obj = new BinaryExpression();
                                    _obj.right = numStack.pop();
                                    _obj.left = numStack.pop();
                                }
                                if (_obj.type !== 'MemberExpression')
                                    _obj.operator = opeStack.pop();

                                if (_obj.operator == '/' && _obj.right.value == 0) {
                                    this.printError(`bad expression: something / 0`, token);
                                }
                                numStack.push(_obj);
                                arr.unshift(token);
                                continue;
                            }
                            else {
                                this.printError(`unexpected character \`${token.value}\``, token);
                            }
                        }
                    }
                }
            }
            else {
                this.printError(`unexpected character \`${token.value}\``, token);
            }

        }

        while (opeStack.length > 0 && numStack.length > 0) {
            let _obj = null;
            const operator = opeStack.pop();
            if (operator == '!') {
                _obj = new UnaryExpression();
                _obj.right = numStack.pop();
                _obj.operator = operator;
                _obj.prefix = true;
            }
            else {
                _obj = new BinaryExpression();
                _obj.right = numStack.pop();
                _obj.left = numStack.pop();
                _obj.operator = operator;
            }
            numStack.push(_obj);
        }

        // 处理类似于 {{ -1 }} 的情况
        if (numStack[0].type == 'BinaryExpression') {
            const left = numStack[0].left;
            const right = numStack[0].right;
            const operator = numStack[0].operator;
            let prefix = false;
            if (!left) {
                prefix = true;
            }
            if (!operator) this.printError(`bad attr `, this.viewToken());
            if (!left || !right) {
                numStack[0] = new UnaryExpression();
                numStack[0].operator = operator;
                numStack[0].prefix = prefix;
                if (right) numStack[0].argument = right;
                else if (left) numStack[0].argument = left;
            }
        }

        if (jump && this.index < this.tokens.length - 1 && this.viewToken().value == '}}') {
            this.index++;
        }

        const result = numStack.pop();
        result.setStart(start);
        result.setEnd(end);
        if (exp && exp.type == 'ExpressionStatement') {
            exp.expression = result;
        }
        else {
            return result;
        }
    }

    private parseCondition(exp: ExpressionStatement): void {
        const obj = new ConditionalExpression();
        obj.setStart(this.tokens[this.index + 1])
        let arr = [];
        // 提取整个表达式
        while (this.viewToken().value != '}}') {
            arr.push(this.getToken());
        }
        obj.setEnd(this.tokens[this.index]);

        const splitToken1 = new Token();
        splitToken1.type = CharacterType.Operator;
        splitToken1.value = '?';
        const splitToken2 = new Token();
        splitToken2.type = CharacterType.Operator;
        splitToken2.value = ':';
        let arr2 = this.splitArray(arr, splitToken1);
        if (arr2.length > 2) {
            this.printError(`bad attr `, this.viewToken());
        }
        const _arr = arr2.pop();
        let arr3 = this.splitArray(_arr, splitToken2);
        arr3.unshift(arr2.pop());
        if (arr2.length > 3) {
            this.printError(`bad attr `, this.viewToken());
        }

        const bufferTokens = this.tokens;
        const bufferIndex = this.index;
        let test = [];
        let consequent = [];
        let alternate = [];
        this.tokens = arr3[0];
        // console.log(1)
        this.index = -1;
        this.parseExpression(test);
        this.tokens = arr3[1];
        // console.log(2)
        this.index = -1;
        if (this.tokens.length == 1 && this.tokens[0].type == CharacterType.Number) {
            this.parseNumber(consequent);
        }
        else {
            this.parseExpression(consequent);
        }
        this.tokens = arr3[2];
        // console.log(3)
        this.index = -1;
        if (this.tokens.length == 1 && this.tokens[0].type == CharacterType.Number) {
            this.parseNumber(alternate);
        }
        else {
            this.parseExpression(alternate);
        }
        this.tokens = bufferTokens;
        this.index = bufferIndex;
        obj.test = test[0];
        obj.consequent = consequent[0];
        obj.alternate = alternate[0];
        if (this.viewToken().value == '}}') {
            this.index++;
        }
        exp.expression = obj;
        // console.log(this.tokens[this.index])
    }



    private isOperand(target: Token | Expression): boolean {
        if (target.type == CharacterType.Identifier ||
            target.type == CharacterType.Number) {
            return true;
        }
        else if (target.type.toString().indexOf('Expression') > -1) {
            return true;
        }
        else {
            return false;
        }
    }

    private isOperator(target: Token): boolean {
        if (target.type == CharacterType.Operator &&
            Object.keys(OperatorIndex).includes(target.value)) {
            return true;
        }
        else if (['[', ']', '...', '.'].includes(target.value)) {
            return true;
        }
        else {
            return false;
        }
    }

    private isOperateDelimiter(target: Token): boolean {
        if (target.type == CharacterType.Delimiters &&
            ['(', ')'].includes(target.value)) {
            return true;
        }
        else {
            return false;
        }
    }


    // 将数组通过 key 分割为多个数组
    private splitArray(arr: Array<any>, key: Token): Array<Array<any>> {
        let result = [];
        let buffer = new Array();
        for (const child of arr) {
            if (child.type == key.type &&
                child.value == key.value) {
                // if (buffer.length != 1 &&
                //     buffer.length != 2) {
                //     t his.sendError('wrong form in splitArray');
                // }
                result.push(buffer);
                buffer = new Array();
                continue;
            }
            if (child.value != '[' &&
                child.value != ']') {
                buffer.push(child);
            }
        }
        if (buffer.length > 0) {
            result.push(buffer);
        }
        return result;
    }

    // 从 token流 中取一个token
    private getToken(): Token {
        return this.tokens[++this.index];
    }

    // 检查下一个token是否为指定类型及指定值，是的情况下跳过
    private checkToken(type: number, value: string, token?: Token): boolean {
        let _token = null;
        token ? (_token = token) : (_token = this.tokens[this.index + 1]);
        if (_token.type == type && _token.value == value) {
            if (!token) {
                this.index++;
            }
            return true;
        }
        else {
            return false;
        }
    }

    // 查看下一个token
    private viewToken(): Token {
        if (this.tokens.length - 1 < this.index + 1) {
            this.printError(`end tag missing, near \`\``);
        }
        return this.tokens[this.index + 1];
    }

    private viewTop(arr: any[]): any {
        if (arr.length == 0) this.sendError('array length == 0 in viewTop');
        return arr[arr.length - 1];
    }

    private sendError(message: string): void {
        throw ("SyntacticParser Error: " + message);
    }

    private printError(message: string, token?: Token): void {
        if (token)
            error("SyntacticParser Error: " + message, token.line, token.start);
        else
            error("SyntacticParser Error: " + message);
    }

}