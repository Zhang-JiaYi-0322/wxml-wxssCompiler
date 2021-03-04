import * as TYPE from '../SyntacticParser/TypeDefination';
import * as AST_NODE from './AstType';
import { error } from '../parser';
import fs from 'fs';
// import { components } from './Components';

export class AstGenerator {

    // private tree: { root: TYPE.Node[] };
    private ast: AST_NODE.Root;
    private count = 1;
    private keyCount = 1;
    private binding = [];
    private parent = [];
    private node = [];
    private name = 'nex';
    private declarations = [];
    private bindingIgnore = [];
    private forNameStack = []; // 存储 index, item 的名字，避免重复
    private forIndexCount = 1;
    private forItemCount = 1;
    private children = [];
    private rootNodes = [];
    private ifDeclarations = [];

    constructor() {
        this.ast = new AST_NODE.Root;
    }

    public generateAst(tree: { root: TYPE.Node[] }): AST_NODE.Root {
        for (const child of tree.root) {
            if (child.type == 'node')
                this.createNode(child, this.ast.body);
            else {
                // console.log(child)
                const exp = new AST_NODE.ExpressionStatement();
                exp.expression = new AST_NODE.CallExpression();
                exp.expression.callee = new AST_NODE.MemberExpression();
                exp.expression.callee.object = new AST_NODE.Identifier('View');
                exp.expression.callee.property = new AST_NODE.Identifier('setText');
                exp.expression.arguments.push(child);
                this.ast.body.push(exp);
            }
        }
        if (this.parent.length > 0 ||
            this.node.length > 0) {
            this.printError('unexpected result when parsing ast', this.ast.body.pop());
        }

        this.declarations = this.declarations.reverse();
        for (const dec of this.declarations) {
            this.ast.body.unshift(dec);
        }

        // return this.ast;
        return this.creatFunction();
    }

    // 创建最外层函数包装
    private creatFunction(): any {
        const call = new AST_NODE.CallExpression();
        call.callee = new AST_NODE.FunctionExpression();
        call.callee.params.push(new AST_NODE.Identifier('binding'),
            new AST_NODE.Identifier('options'));
        call.callee.body = new AST_NODE.BlockStatement();
        call.callee.body.body = this.ast.body;
        const returnExp = new AST_NODE.ReturnStatement();
        const arrayExpression = new AST_NODE.ArrayExpression();
        arrayExpression.elements = this.rootNodes;
        returnExp.argument = arrayExpression;
        call.callee.body.body.push(returnExp);
        const varDec = new AST_NODE.VariableDeclarator();
        varDec.id = new AST_NODE.Identifier('func');
        varDec.init = call.callee;
        const _var = new AST_NODE.VariableDeclaration();
        _var.declarations.push(varDec);
        _var.kind = 'var';

        const root = new AST_NODE.Root();
        root.body.push(_var);
        const exp = new AST_NODE.ExpressionStatement();
        exp.expression = new AST_NODE.Identifier('func');
        root.body.push(exp);

        // fs.writeFileSync('./generateResult.json',JSON.stringify(root,null,4));
        return root;
        // return _var;
    }

    // 创建节点
    private createNode(node: TYPE.Node, arr: any[]): any {
        // this.ifStack = [];
        let attrStack = [];


        this.node.push(node);

        const classDeclaration = new AST_NODE.ClassDeclaration();
        classDeclaration.body = new AST_NODE.ClassBody();

        let id = '';
        if (node.attribute.length > 0) {
            for (const attr of node.attribute) {
                // 初始化类名
                if (attr.key == 'id') {
                    // if (!classDeclaration.id)
                    //     classDeclaration.id = new AST_NODE.Identifier(attr.value[0].name);
                    if (id == '') {
                        if (attr.value[0].type == 'Identifier')
                            id = attr.value[0].name;
                        else
                            id = attr.value[0].value;
                    }
                    break;;
                }
            }
        }
        // 未指定 id 的情况下自行生成一个 id
        // if (!classDeclaration.id) {
        // classDeclaration.id = new AST_NODE.Identifier(this.name + this.count.toString());
        if (id == '') {
            id = this.name + this.count.toString();
            this.count++;
        }
        node.label = node.label[0].toUpperCase() + node.label.slice(1);
        classDeclaration.id = new AST_NODE.Identifier(node.label);
        // classDeclaration.id = new AST_NODE.Identifier(components[node.label]);
        const name = new AST_NODE.Identifier(id)
        this.parent.push(name);
        this.rootNodes.push(name);
        this.sortChildren(node, name);

        // 继承父类
        // classDeclaration.superClass = new AST_NODE.Identifier(node.label);
        // 处理属性
        let buffer = [];
        // let shouldUnshfit = false;
        if (node.attribute.length > 0) {
            // const method = new AST_NODE.MethodDefinition();
            // let array = this.createConstructor(method);

            node.attribute.reverse();
            while (node.attribute.length > 0) {
                const attr = node.attribute.pop();
                this.sortDataBinding(attr, name);
                // 合并如 "item-{{a}}" 的复合属性值
                if (attr.value.length > 1) {
                    this.sortAttrValue(attr, name);
                }
                // 初始化类名
                if (attr.key == 'id') {
                    continue;
                }
                // 处理保留字
                else if (attr.lib) {
                    // if (['else', 'elif'].includes(attr.key))
                    //     shouldUnshfit = true;
                    const result = this.createReserverd(attr, node.attribute);
                    if (result) {
                        // if(['if','else','elif'].includes(attr.key))
                        //     if_obj = result.
                        buffer.push(result);
                    }
                    // array.push(result);
                }
                else {
                    attrStack.push(this.createAttribute(attr, { id: name }));
                }
            }

            // classDeclaration.body.body.push(method);
        }


        // 创建实例
        this.createInstance(this.declarations, node.label, id);
        // 插入数据绑定声明
        this.createDataBinding(this.declarations, name);
        // 属性赋值
        this.declarations.push(this.createEvaluation(id, 'id', name.name));
        for (const attribute of attrStack) {
            // arr.push(this.createEvaluation(id, attribute.left.property.name, attribute.right));
            arr.push(attribute);
        }
        buffer.map(item => {
            arr.push(item);
        })

        // 处理 children
        if (!node.childrenCreated) {
            const length = this.ifDeclarations.length;
            for (const child of node.children) {
                // this.sortDataBinding(child);
                // this.createChild(child, array);
                this.createChild(child, this.children);
                // this.addChildDeclaration(id, arr, false);
            }
            this.ifDeclarations.length = length;
        }

        // children
        this.children.map(child => {
            if (!arr.includes(child))
                arr.push(child);
        })



        this.parent.pop();
        this.node.pop();
        // this.binding = [];
        // this.declarations = [];
    }


    // 创建类的实例
    private createInstance(arr: any[], className: string, id: string): any {
        const idDec = new AST_NODE.VariableDeclaration();
        idDec.kind = 'const';
        const _idDec = new AST_NODE.VariableDeclarator();
        _idDec.id = new AST_NODE.Identifier(id);
        _idDec.init = new AST_NODE.NewExpression();
        _idDec.init.callee = new AST_NODE.ConditionalExpression();
        _idDec.init.callee.test = new AST_NODE.MemberExpression();
        _idDec.init.callee.test.object = new AST_NODE.Identifier('WX');
        _idDec.init.callee.test.property = new AST_NODE.Identifier(className);
        _idDec.init.callee.consequent = new AST_NODE.MemberExpression();
        _idDec.init.callee.consequent.object = new AST_NODE.Identifier('WX');
        _idDec.init.callee.consequent.property = new AST_NODE.Identifier(className);
        _idDec.init.callee.alternate = new AST_NODE.MemberExpression();
        _idDec.init.callee.alternate.object = new AST_NODE.Identifier('WX');
        _idDec.init.callee.alternate.property = new AST_NODE.Identifier('Element');
        const literal = new AST_NODE.Literal();
        // const text = 'Element_' + String(this.keyCount++);
        const text = id + '_';
        literal.raw = `"${text}"`;
        literal.value = text;
        _idDec.init.arguments.push(literal, new AST_NODE.Identifier('options'));
        idDec.declarations.push(_idDec);
        arr.push(idDec);
        return idDec;
        // arr.push(this.createDocExp(id));
    }

    // 给实例赋值
    private createEvaluation(target: string, key: string, value: any): any {
        const exp = new AST_NODE.ExpressionStatement();
        const callExp = new AST_NODE.CallExpression();
        callExp.callee = new AST_NODE.MemberExpression();
        callExp.callee.object = new AST_NODE.Identifier(target);
        callExp.callee.property = new AST_NODE.Identifier('setAttribute');
        const l1 = new AST_NODE.Literal();
        l1.raw = `"${key}"`;
        l1.value = key;
        callExp.arguments.push(l1);

        if (key !== 'id') {
            callExp.arguments.push(value);
        }
        else {
            if (typeof value === 'string') {
                const l2 = new AST_NODE.Literal();
                l2.raw = `"${value}"`;
                l2.value = value;
                callExp.arguments.push(l2);
            }
            else {
                callExp.arguments.push(value);
            }
        }
        exp.expression = callExp;
        return exp;
    }

    // 分流保留字
    private createReserverd(attr: TYPE.Attribute, attrArray: TYPE.Attribute[], helper?: any[]): any {
        let result = null;
        // if (attr.value[0].type == 'Identifier' ||
        //     attr.value[0].type == 'TemplateLiteral') {
        //     this.sortDataBinding(attr);
        // }
        switch (attr.lib) {
            case 'wx':
                // result = this.createWxReserverd(attr, result, attrArray);
                result = this.createWxReserverd(attr, result, attrArray, helper);
                break;
            default:
                this.printError(`unexpected character \`${attr.lib}\``, attr);
        }
        return result;
    }

    // 创建 wx 保留字节点
    // todo 目前支持 if, else, elif, for, for_index, for_item
    //      目前不支持: key
    private ifStack: any[] = []; // 用以获取与 else 对应的 if
    private createWxReserverd(attr: TYPE.Attribute, node: any, attrArray: TYPE.Attribute[], helper: any[]): any {
        switch (attr.key) {
            case 'if':
                node = new AST_NODE.IfStatement();
                node.test = attr.value[0];
                node.consequent = new AST_NODE.BlockStatement();
                const length1 = this.ifDeclarations.length;
                for (const child of this.viewTop(this.node).children) {
                    if (!this.viewTop(this.node).childrenCreated) {
                        this.viewTop(this.node).childrenCreated = true;
                    }
                    // node.consequent.body.push(this.children.shift());
                    const obj = this.createChild(child, node.consequent.body, true);
                    // if (obj)
                    //     this.addChild(obj.parent, obj._var, node.consequent.body, true, true, helper);
                    // else
                    //     this.addChild("", null, node.consequent.body, true, true, helper);
                    // this.addChildDeclaration(parent.name, node.consequent.body, true);
                }
                this.ifDeclarations.length = length1;
                this.ifStack.push(node);
                // break;
                return node;
            case 'else':
                if (this.ifStack.length == 0) {
                    this.printError(`bad attr \`${attr.lib}:${attr.key}\` without IfStatement`, attr);
                }
                const _if = this.ifStack.pop();
                _if.alternate = new AST_NODE.BlockStatement();
                const length2 = this.ifDeclarations.length;
                for (const child of this.viewTop(this.node).children) {
                    if (!this.viewTop(this.node).childrenCreated) {
                        this.viewTop(this.node).childrenCreated = true;
                    }
                    // _if.alternate.body.push(this.children.shift());
                    const obj = this.createChild(child, _if.alternate.body, true);
                    // if (obj)
                    //     this.addChild(obj.parent, obj._var, _if.alternate.body, true, true, helper);
                    // else
                    //     this.addChild("", null, _if.alternate.body, true, true, helper);
                    // this.addChildDeclaration(parent.name, _if.alternate.body, true);
                }
                this.ifDeclarations.length = length2;
                break;
            case 'elif':
                if (this.ifStack.length == 0) {
                    this.printError(`bad attr \`${attr.lib}:${attr.key}\` without IfStatement`, attr);
                }
                const __if = this.ifStack.pop();
                __if.alternate = new AST_NODE.IfStatement();
                __if.alternate.test = attr.value[0];
                __if.alternate.consequent = new AST_NODE.BlockStatement();
                const length3 = this.ifDeclarations.length;
                for (const child of this.viewTop(this.node).children) {
                    if (!this.viewTop(this.node).childrenCreated) {
                        this.viewTop(this.node).childrenCreated = true;
                    }
                    // __if.alternate.consequent.body.push(this.children.shift());
                    const obj = this.createChild(child, __if.alternate.consequent.body, true);
                    // if (obj)
                    //     this.addChild(obj.parent, obj._var, __if.alternate.consequent.body, true, true, helper);
                    // else
                    //     this.addChild("", null, __if.alternate.consequent.body, true, true, helper);
                    // this.addChildDeclaration(parent.name, __if.alternate.consequent.body, true);
                }
                this.ifDeclarations.length = length3;
                this.ifStack.push(__if.alternate);
                break;
            case 'for':
                let index = 'index';
                let item = 'item';
                for (const child of attrArray) {
                    if (child.lib == 'wx' && child.key == 'for_index') {
                        if (child.value[0].type != 'Literal') {
                            this.printError(`unexpected character type \`${child.value[0].type}\``, child.value[0]);
                        }
                        index = child.value[0].value;
                        this.bindingIgnore.push(index);
                    }
                    else if (child.lib == 'wx' && child.key == 'for_item') {
                        if (child.value[0].type != 'Literal') {
                            this.printError(`unexpected character type \`${child.value[0].type}\``, child.value[0]);
                        }
                        item = child.value[0].value;
                        this.bindingIgnore.push(item);
                    }
                }
                if (this.forNameStack.includes(index)) {
                    index = index + this.forIndexCount++;
                }
                if (this.forNameStack.includes(item)) {
                    item = item + this.forItemCount++;
                }
                this.forNameStack.push(index);
                this.forNameStack.push(item);
                node = new AST_NODE.ForStatement(attr.value[0], index, item);
                const dec = node.body.body.shift();
                for (const child of this.viewTop(this.node).children) {
                    if (!this.viewTop(this.node).childrenCreated) {
                        this.viewTop(this.node).childrenCreated = true;
                    }
                    const length = this.ifDeclarations.length;
                    const obj = this.createChild(child, node.body.body, true);
                    this.ifDeclarations.length = length;
                    // if (obj)
                    //     this.addChild(obj.parent, obj._var, node.body.body, false, true, []);
                    // else
                    //     this.addChild("", null, node.body.body, false, true, []);
                    // this.addChildDeclaration(parent.name, node.body.body, true, true, node.body.body);
                }
                node.body.body.unshift(dec);
                return node;
            case 'for_index':
            case 'for_item':
                if (attrArray.length > 0) {
                    if (attrArray.length == 1 &&
                        (attrArray[0].lib == 'wx' && ['for_index', 'for_item'.includes(attrArray[0].value[0].name)])) {
                        break;
                    }
                    attrArray.unshift(attr);
                }
                break;
            default:
                this.printError(`unexpected character \`${attr.value}\``, attr);
        }
    }

    // 创建普通属性节点
    private createAttribute(attr: TYPE.Attribute, parent: any): any {
        if (attr.value.length > 0) {
            // const node = new AST_NODE.AssignmentExpression();
            // node.operator = '=';
            // node.left = new AST_NODE.MemberExpression();
            // if (!parent) {
            //     node.left.object = new AST_NODE.ThisExpression();
            // }
            // else {
            //     node.left.object = parent.id;
            // }
            // node.left.property = new AST_NODE.Identifier(attr.key);
            // node.right = attr.value[0];
            // const exp = new AST_NODE.ExpressionStatement();
            // exp.expression = node
            // return node;
            return this.createEvaluation(parent.id.name, attr.key, attr.value[0]);
        }
        else {
            this.printError(`bad attr \`${attr.key}\` without value`, attr);
        }
    }

    // 整理数据绑定数据
    private sortDataBinding(obj: any, parent: any): void {
        if (obj.type == 'Identifier' && obj.binding) {
            this.binding.push({ target: obj, parent, created: false });
            return;
        }
        for (const key in obj) {
            if (obj.type === 'MemberExpression' && !obj.computed && key === 'property') {
                if (obj[key].type === 'Identifier') {
                    continue;
                }
            }
            if (obj[key] && obj[key].type == 'Identifier' && obj[key].binding) {
                this.binding.push({ target: obj[key], parent, created: false });
            }
            else if (typeof (obj[key]) == 'object' && obj[key].length > 0) {
                for (const child of obj[key]) {
                    if (child.type == 'Property') {
                        continue;
                    }
                    this.sortDataBinding(child, parent);
                }
            }
            else if (obj[key] && obj[key].type) {
                this.sortDataBinding(obj[key], parent);
            }
        }
    }

    // 统一生成所有数据绑定并添加到 constructor 的最前面
    private createDataBinding(arr: any[], parent: AST_NODE.Identifier): void {
        // 去除重复的数据绑定
        this.binding = sort(this.binding);
        let _arr = [];
        for (const item of this.binding) {
            const child = item.target;
            const id = item.parent;
            if (item.created) {
                continue;
            }
            else if (id !== parent) {
                continue;
            }
            else if (AST_NODE.ReserverdWord.includes(child.name) ||
                this.bindingIgnore.includes(child.name)) {
                continue;
            }
            item.created = true;
            const literal = new AST_NODE.Literal();
            literal.value = child.name;
            literal.raw = `"${child.name}"`;
            const declarator = new AST_NODE.VariableDeclarator();
            declarator.id = child;
            // declarator.init = new AST_NODE.CallExpression();
            // declarator.init.arguments.push(id, literal);
            // declarator.init.callee = new AST_NODE.MemberExpression();
            // declarator.init.callee.object = new AST_NODE.Identifier('DataBinding');
            // declarator.init.callee.property = new AST_NODE.Identifier('bind');
            declarator.init = new AST_NODE.MemberExpression();
            declarator.init.object = new AST_NODE.Identifier('binding');
            declarator.init.property = child;

            const _var = new AST_NODE.VariableDeclaration();
            _var.kind = 'const';
            _var.declarations.push(declarator);
            _arr.push(_var);
        }

        for (const child of _arr.reverse()) {
            arr.push(child);
        }

        function sort(binding: any[]): any[] {
            const arr = binding;
            let _binding = [];
            let buffer = [];
            for (const item of arr) {
                if (!buffer.includes(item.target.name)) {
                    buffer.push(item.target.name);
                    _binding.push(item);
                }
            }
            return _binding;
        }
    }

    // 整理属性值
    private sortAttrValue(attr: TYPE.Attribute, parent: AST_NODE.Identifier): void {
        // 合并
        const temp = this.createTemplate(attr.value, parent);
        attr.value = [temp];
    }

    // 整理 children
    private sortChildren(node: TYPE.Node, parent: AST_NODE.Identifier): void {
        let _arr = [];
        let output = [];
        for (const child of node.children) {
            if (child.type != 'node') {
                _arr.push(child);
            }
            else {
                // 合并视为文本的内容   ` ${}`
                if (_arr.length > 0) {
                    const expression = new AST_NODE.ExpressionStatement();
                    expression.expression = this.createTemplate(_arr, parent);
                    _arr = [];
                    output.push(expression);
                }
                output.push(child);
            }
        }
        if (_arr.length > 0) {
            const expression = new AST_NODE.ExpressionStatement();
            expression.expression = this.createTemplate(_arr, parent);
            _arr = [];
            output.push(expression);
        }
        node.children = output;
    }

    // 生成文本 `${}`
    private createTemplate(arr: any[], parent: AST_NODE.Identifier): AST_NODE.TemplateLiteral {
        const temp = new AST_NODE.TemplateLiteral();
        // console.log(arr)
        // 格式： quasis[0] expression[0] quasis[1] expression[1] ...... expression[n] quasis[n+1]
        for (const _child of arr) {
            this.sortDataBinding(_child, parent);
            // "test({{true}})" 情况时，true 为 Identifier
            if (_child.type == 'Literal' || (_child.type == 'Identifier' && _child.name == 'true')) {
                // expression 已加入数组时， quasis 中有多余的后缀，需要去除
                if (temp.expressions.length > 0) {
                    temp.quasis.pop();
                }
                if (_child.value == '(' && temp.quasis.length > 0) {
                    const tempElement = temp.quasis.pop();
                    tempElement.value.raw += _child.value;
                    tempElement.value.cooked += _child.value;
                    temp.quasis.push(tempElement);
                }
                else {
                    const tempElement = new AST_NODE.TemplateElement();
                    tempElement.value.raw = _child.value ? _child.value : _child.name;
                    tempElement.value.cooked = _child.value ? _child.value : _child.name;
                    temp.quasis.push(tempElement);
                }
            }
            else {
                // 顶头必须有一个quasis元素，没有值的情况下为 ''
                if (temp.quasis.length == 0) {
                    insertSpace(temp.quasis);
                }
                temp.expressions.push(_child);
                // expressions 新增值以后添加后缀quasis
                insertSpace(temp.quasis);
                // 处理数据绑定
                if (_child.type == 'Identifier') {
                    this.binding.push({ target: _child, parent });
                }
                // 处理expression情况
                else if (_child.type.includes('Expression')) {
                    // this.sortDataBinding(_child)
                }
                // 处理对象 {{ a, b }}
                else if (_child.type == 'BlockStatement') {
                    // this.sortDataBinding(_child);
                }
                else {
                    this.printError(`bad attr`, _child);
                }
            }
        }
        if (temp.expressions.length >= temp.quasis.length) {
            insertSpace(temp.quasis);
        }
        if (temp.quasis.length > 0 && temp.expressions.length == 0) {
            let text = '';
            for (const child of temp.quasis) {
                text += child.value.raw;
            }
            const _temp = new AST_NODE.TemplateElement();
            _temp.value.raw = text;
            _temp.value.cooked = text;
            temp.quasis = [_temp];
            return temp;
        }
        if (temp.quasis.length - temp.expressions.length != 1) {
            console.log(temp.quasis)
            console.log(temp.expressions)
            //     this.printError(`bad attr `, temp);
        }
        temp.quasis[temp.quasis.length - 1].tail = true;
        if (temp.expressions.length == 1 &&
            temp.quasis[0].value.raw == "" &&
            temp.quasis[1].value.raw == "") {
            return temp.expressions[0];
        }
        return temp;


        function insertSpace(target: any): void {
            const tempElement = new AST_NODE.TemplateElement();
            tempElement.value.raw = '';
            tempElement.value.cooked = '';
            target.push(tempElement);
        }
    }

    // 生成子节点
    private createChild(node: any, arr: any[], addId: boolean = true): any {
        if (node.type != 'node') {
            const callExp = new AST_NODE.CallExpression();
            callExp.callee = new AST_NODE.MemberExpression();
            callExp.callee.object = this.viewTop(this.parent);
            callExp.callee.property = new AST_NODE.Identifier('setText');
            if (node.type == 'ExpressionStatement') {
                callExp.arguments.push(node.expression);
            }
            else {
                callExp.arguments.push(this.createTemplate([node], this.viewTop(this.parent)));
            }
            // if (node.type.includes('Expression')) {
            //     this.sortExpression(node);
            // }

            const exp = new AST_NODE.ExpressionStatement();
            exp.expression = callExp;
            arr.push(exp);
        }
        // 子标签
        else {
            // const declarator = new AST_NODE.VariableDeclarator();
            let id = null;
            for (const attr of node.attribute) {
                if (attr.key == 'id') {
                    id = new AST_NODE.Identifier(attr.value[0].value);
                    break;
                }
            }
            // 未指定 id 的情况下自行生成一个 id
            if (!id) {
                id = new AST_NODE.Identifier(this.name + this.count.toString());
                this.count++;
            }
            const parent = this.viewTop(this.parent);

            this.parent.push(id);
            this.sortChildren(node, id);
            this.node.push(node);
            // declarator.init = new AST_NODE.NewExpression();
            // // todo 假设 new view() 不存在 arguments
            // declarator.init.callee = new AST_NODE.MemberExpression();
            // declarator.init.callee.object = new AST_NODE.Identifier('WX');
            // node.label = node.label[0].toUpperCase() + node.label.slice(1);
            // declarator.init.callee.property = new AST_NODE.Identifier(node.label);
            // const _var = new AST_NODE.VariableDeclaration();
            // _var.kind = 'const';
            // _var.declarations.push(declarator);

            node.label = node.label[0].toUpperCase() + node.label.slice(1);
            const _var = this.createInstance([], node.label, id.name);

            let decBuffer = [];

            this.addChild(parent.name, _var, decBuffer, addId, false, []);


            // 处理属性
            let buffer = [];
            let shouldUnshfit = false;
            node.attribute.reverse();
            for (const attr of node.attribute) {
                if (attr.lib) {
                    if (attr.lib === 'wx') {
                        if (['else', 'elif'].includes(attr.key)) {
                            shouldUnshfit = true;
                            // decBuffer = [];
                            // declarator.id = this.viewTop(this.ifDeclarations);
                        }
                        else if (attr.key === 'if') {
                            this.ifDeclarations.push(id);
                        }
                    }
                }
            }
            while (node.attribute.length > 0) {
                const attr = node.attribute.pop();
                this.sortDataBinding(attr, id);
                // 合并如 "item-{{a}}" 的复合属性值
                if (attr.value.length > 1) {
                    this.sortAttrValue(attr, id);
                    // buffer.push(this.createAttribute(attr, { id }));
                }
                // 处理保留字
                if (attr.lib) {
                    const result = this.createReserverd(attr, node.attribute, arr);
                    if (result) {
                        buffer.push(result);
                    }
                }
                else {
                    buffer.push(this.createAttribute(attr, { id }));
                }
            }

            if (shouldUnshfit) {

                const item = arr.pop();
                for (let i = 0; i < decBuffer.length; i++) {
                    arr.push(decBuffer[i]);
                }
                arr.push(item);
            }
            else {
                for (let i = 0; i < decBuffer.length; i++) {
                    arr.push(decBuffer[i]);
                }
            }
            this.createDataBinding(arr, id);
            if (node.childrenCreated) {
                this.parent.pop();
                this.node.pop();
                // if (add)
                //     arr.length = arr.length - 2;
                buffer.map(item => {
                    arr.push(item);
                });
                return { _var, parent: parent.name };
            }

            buffer.map(item => {
                arr.push(item);
            });

            const length = this.ifDeclarations.length;
            for (const child of node.children) {
                this.createChild(child, arr, addId);
                // this.addChildDeclaration(parent.name, arr, false, true, arr);
            }
            this.ifDeclarations.length = length;

            this.parent.pop();
            this.node.pop();
            return { _var, parent: parent.name };
        }
    }

    private addChild(parent: string, target: any, arr: any[], id: boolean = true, unshift: boolean = false, helper: any[] = []): void {
        if (helper.length > 0) {
            if (id) {
                const a = helper.pop();
                const b = helper.pop();
                const c = helper.pop();
                arr.unshift(a);
                arr.unshift(b);
                arr.unshift(c);
            }
            else {
                const a = helper.pop();
                const b = helper.pop();
                arr.unshift(a);
                arr.unshift(b);
            }
            return;
        }

        const call = new AST_NODE.CallExpression();
        call.callee = new AST_NODE.MemberExpression();
        call.callee.object = new AST_NODE.Identifier(parent);
        call.callee.property = new AST_NODE.Identifier('appendChild');
        call.arguments.push(target.declarations[0].id);
        const exp = new AST_NODE.ExpressionStatement();
        exp.expression = call;

        const name = target.declarations[0].id.name;
        const dec = this.createEvaluation(name, 'id', name);

        if (unshift) {
            arr.unshift(exp);
            if (id) arr.unshift(dec);
            arr.unshift(target);
        }
        else {
            arr.push(target);
            if (id) arr.push(dec);
            arr.push(exp);
        }
    }

    private viewTop(arr: any[]): any {
        if (arr.length == 0) {
            this.sendError('array length == 0');
        }
        return arr[arr.length - 1];
    }

    private sendError(message: string): void {
        throw ('AstGenerator Error: ' + message);
    }

    private printError(message: string, obj: any): void {
        error("AstGenerator Error: " + message, obj._bline, obj._start);
    }
}