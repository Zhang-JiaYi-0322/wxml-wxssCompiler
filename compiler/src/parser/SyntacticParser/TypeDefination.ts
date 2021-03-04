export class Node {
    type = 'node';
    label: string = "";
    attribute: Attribute[] = [];
    children: Node[] = [];
    childrenCreated: boolean = false;

    _bline: number;
    _eline: number;
    _start: number;
    _end: number;

    set(token: Token) {
        this._bline = token.line;
        this._eline = token.line;
        this._start = token.start;
        this._end = token.end;
    }

    setStart(token: Token) {
        this._bline = token.line;
        this._start = token.start;
    }

    setEnd(token: Token) {
        this._eline = token.line;
        this._end = token.end;
    }
}


export class Token {
    value: string;
    type: number;
    line: number;
    start: number;
    end: number;
    
}

export class Expression {
    type: string;
    _bline: number;
    _eline: number;
    _start: number;
    _end: number;

    set(token: Token) {
        this._bline = token.line;
        this._eline = token.line;
        this._start = token.start;
        this._end = token.end;
    }

    setStart(token: Token) {
        this._bline = token.line;
        this._start = token.start;
    }

    setEnd(token: Token) {
        this._eline = token.line;
        this._end = token.end;
    }

    _setStart(token: any) {
        this._bline = token._bline;
        this._start = token._start;
    }

    _setEnd(token: any) {
        this._eline = token._eline;
        this._end = token._end;
    }
}

export class Attribute extends Expression {
    key: string = "";
    value: Array<any> = [];
    lib?: string;
}

export class ExpressionStatement extends Expression {
    type = 'ExpressionStatement';
    expression: any;
}

export class UpdateExpression extends Expression {
    type = 'UpdateExpression';
    operator: string;
    prefix: boolean = false; // 符号在左侧为true
    argument: any;
}

export class UnaryExpression extends Expression {
    type = 'UnaryExpression';
    operator: string;
    prefix: boolean = false;
    argument: any;
}

export class BinaryExpression extends Expression {
    type = 'BinaryExpression';
    left: any;
    right: any;
    operator: string;
}

export class ConditionalExpression extends Expression {
    type = 'ConditionalExpression';
    test: any;
    consequent: any;
    alternate: any;
}

export class MemberExpression extends Expression {
    type = 'MemberExpression';
    object: any;
    property: any;
    computed: boolean = true;
    // optional: boolean    // 暂时不知道干什么用的
}

export class ArrayExpression extends Expression {
    type = 'ArrayExpression';
    elements: any[] = [];
}

export class BlockStatement extends Expression {
    type = 'BlockStatement';
    body: any[];
}

export class LabeledStatement extends Expression {
    type = 'LabeledStatement';
    label: string;
    body: any;
}

export class Identifier extends Expression {
    type = 'Identifier';
    name: string;
    binding = true;

    constructor(token?: Token) {
        super();
        if (token) {
            this.name = token.value;
            this._bline = token.line;
            this._eline = token.line;
            this._start = token.start;
            this._end = token.end;
        }
    }

    
}

export class Literal extends Expression {
    type = 'Literal';
    raw: string;
    value: number | string;

    constructor(token?: Token) {
        super();
        if (token) {
            this._bline = token.line;
            this._eline = token.line;
            this._start = token.start;
            this._end = token.end;
        }
    }
}

export class SpreadElement extends Expression {
    type = 'SpreadElement';
    argument: any;
}

export class SequenceExpression extends Expression {
    type = 'SequenceExpression';
    expression: any;
}

export class ObjectExpression extends Expression {
    type = 'ObjectExpression';
    properties: any[] = [];
}

export class Property extends Expression {
    type = 'Property';
    method: boolean = false;
    shorthand: boolean = false;
    computed: boolean = false;
    key: any;
    value: any;
    kind: string = 'init';
}