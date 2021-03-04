import { BinaryExpression, UpdateExpression } from "../SyntacticParser/TypeDefination";

export class Node {
    protected type: string;
    // start: number;
    // end: number;
}

export class Root extends Node {
    type: string = 'Program';
    body: any[] = [];
    sourceType: string = 'script';
}

export class ClassDeclaration extends Node {
    type = 'ClassDeclaration';
    id: Identifier;
    superClass: Identifier;
    body: ClassBody;
}

export class ClassBody extends Node {
    type = 'ClassBody';
    body: any[] = [];
}

export class MethodDefinition extends Node {
    type = 'MethodDefinition';
    kind: string;
    static: boolean = false;
    computed: boolean = false;
    key: Identifier;
    value: FunctionExpression;
}

export class FunctionExpression extends Node {
    type = 'FunctionExpression';
    params = [];
    // ......
    body: BlockStatement;
}

export class BlockStatement extends Node {
    type = 'BlockStatement';
    body: any[] = [];
}

export class VariableDeclaration extends Node {
    type = 'VariableDeclaration';
    kind: string;
    declarations: VariableDeclarator[] = [];
}

export class VariableDeclarator extends Node {
    type = 'VariableDeclarator';
    id: Identifier;
    init: any;
}

export class Identifier extends Node {
    type = 'Identifier';
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}

export class NewExpression extends Node {
    type = 'NewExpression';
    callee: Identifier;
    arguments: any[] = [];
}

export class CallExpression extends Node {
    type = 'CallExpression';
    callee: any;
    arguments: any[] = [];
    optional: boolean = false;
}

export class ExpressionStatement extends Node {
    type = 'ExpressionStatement';
    expression: any;
}

export class IfStatement extends Node {
    type = 'IfStatement';
    test: Identifier;
    consequent: any;
    alternate: any | null;
}

export class AssignmentExpression extends Node {
    type = 'AssignmentExpression';
    operator: string;
    left: any;
    right: any;
    kind: string = 'var';
}

export class MemberExpression extends Node {
    type = 'MemberExpression';
    object: any;
    property: any;
    computed: boolean = false;
    // optional: boolean = false;
}

export class ThisExpression extends Node {
    type = 'ThisExpression';
}

export class Literal extends Node {
    type = 'Literal';
    raw: string;
    value: number | string;
}

export class TemplateLiteral extends Node {
    type = 'TemplateLiteral';
    expressions: any[] = [];
    quasis: TemplateElement[] = [];
}

export class TemplateElement extends Node {
    type = 'TemplateElement';
    value: {
        raw: string,
        cooked: string
    } = { raw: "", cooked: "" };
    tail: boolean = false;
}

export class ForStatement extends Node {
    type = 'ForStatement';
    init: VariableDeclaration;
    test: BinaryExpression;
    update: UpdateExpression;
    body: BlockStatement;

    constructor(obj: any, index?: string, item?: string) {
        super();

        if (!index) {
            index = 'index';
        }
        if (!item) {
            item = 'item';
        }

        this.init = new VariableDeclaration();
        this.init.kind = 'let';
        const declarator = new VariableDeclarator();
        declarator.id = new Identifier(index);
        declarator.init = new Literal();
        declarator.init.value = 0;
        declarator.init.raw = '0';
        this.init.declarations.push(declarator);

        this.test = new BinaryExpression();
        this.test.left = new Identifier(index);
        this.test.operator = '<';
        this.test.right = new MemberExpression();
        this.test.right.property = new Identifier('length');
        this.test.right.object = obj;

        this.update = new UpdateExpression();
        this.update.operator = '++';
        this.update.argument = new Identifier(index);

        this.body = new BlockStatement();
        const _var = new VariableDeclaration();
        _var.kind = 'let';
        const _varDec = new VariableDeclarator();
        _varDec.id = new Identifier(item);
        _varDec.init = new MemberExpression();
        _varDec.init.computed = true;
        _varDec.init.object = obj;
        _varDec.init.property = new Identifier(index);
        _var.declarations.push(_varDec);
        this.body.body.push(_var);
    }
}

export class ReturnStatement extends Node {
    type = 'ReturnStatement';
    argument: any;
}

export class ArrayExpression extends Node {
    type = 'ArrayExpression';
    elements: any[] = [];
}

export class ObjectExpression extends Node {
    type = 'ObjectExpression';
    properties: any[] = [];
}

export class ConditionalExpression extends Node {
    type = 'ConditionalExpression';
    test: any;
    consequent: any;
    alternate: any;
}

// export class Program extends Node {
//     type = 'Program';
//     body: any[] = [];
//     sourceType = 'module';
// }

export class Super extends Node {
    type = 'Super';
}

export const ReserverdWord = [
    'if',
    'else',
    'elif',
    'for',
    // 'item',
    // 'index',
    'true',
    'false'
]
