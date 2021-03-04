export const enum CharacterType {
    Selector,   // 0
    MiddleSelector, // 1
    Delimiter,  // 2
    Import, // 3
    Identifier, // 4
    Key,    // 5
    PropertyOperator,   // 6
    Value,  // 7
    Path,    // 8
    Position,    // 9
    Break   // 10
}

export const Space = [
    ' ',
    '\r',
    '\n'
];

export const Selector = [
    '.',
    '#',
    '@'
];

export const MiddleSelector = ['::', ':'];

export const Break = ',';

export const Delimiter = [
    ';',
    '{',
    '}',

];

export const OpenDelimiter = {
    '{': '}'
};

export const CloseDelimiter = {
    '}': '{'
};

export const PropertyOperator = ":";

export const ImportMark = "@import";

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
    '-'
];