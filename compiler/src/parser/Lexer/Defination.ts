import { components } from '../AstGenerator/Components'

export const enum CharacterType {
    Delimiters, // 界符 0
    Identifier, // 标识符 1
    ReservedWord, // 保留字 2
    Operator, // 运算符 3
    Word, // 字符 4
    Number, // 数字 5
    Label // 组件 6
}

export const Delimiter = [
    '<',
    '>',
    '</',
    '{',
    '}',
    '{{',
    '}}',
    '(',
    ')',
    '"',
    '<!--',
    '-->',
    '[',
    ']',
    ',',
    '/>'
]

export const DelimiterMatcher = {
    '>': '<',
    '>1': '</',
    '}': '{',
    '}}': '{{',
    ')': '(',
    '"': '"',
    '-->': '<!--',
    ']': '[',
    '/>': '<'
}

export const OpenDelimiter = [
    '<',
    '</',
    '{',
    '{{',
    '"',
    '<!--',
    '(',
    '['
]

export const CloseDelimiter = [
    '>',
    '}',
    '}}',
    '"',
    '-->',
    ')',
    ']',
    '/>'
]

export const ReserverdWord = [
    'wx',
    // 'wx:if',
    // 'wx:else',
]

export const Operator = [
    '+',
    '-',
    '*',
    '/',
    '^',
    "=",
    '+=',
    '-=',
    '*=',
    '/=',
    '==',
    '===',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    '&&',
    '||',
    '&',
    '|',
    '!',
    '...',
    '?',
    ':',
    '.',
    '%',
    '++',
    '--'
]

export const OperatorIndex = {
    ')': 10,
    ']': 10,
    '++': 8,
    '--': 8,
    '!': 6,
    '^': 4,
    '%': 2,
    '*': 2,
    '/': 2,
    '+': 0,
    '-': 0,
    '==': -2,
    '===': -2,
    '>': -2,
    '<': -2,
    '<=': -2,
    '>=': -2,
    '&&': 0,
    '||': 0,
    '(': -4,
    '[': -4
}

// 未入栈的
export const RightOperatorIndex = {
    ']': -4,
    ')': -4,
    '++': 7,
    '--': 7,
    '!': 5,
    '^': 3,
    '%': 1,
    '*': 1,
    '/': 1,
    '+': -1,
    '-': -1,
    '==': -3,
    '===': -3,
    '>': -3,
    '<': -3,
    '<=': -3,
    '>=': -3,
    '(': 10,
    '[': 10
}

export const IdentifierChar = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '_',
    '$',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    // '.',
    // '-'
];

export const Space = [
    ' ',
    '\n',
    '\r'
]

export const Label = Object.keys(components);