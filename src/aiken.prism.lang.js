Prism.languages.aiken = {
	'string': /".*"/,
    'comment': /\/\/.*/,
    'number': /(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:E[+-]?\d+)?/i,
    'boolean': /\btrue|false\b/,
    'class-name': /\b[A-Z]\w*\b/,
    'punctuation': /\./,
    'function-definition': {
        pattern: /\b(fn|test\s)[^(]*/,
        alias: 'function',
        lookbehind: true
    },
    'variable': {
        pattern: /\b(let\s)[^=]*/,
        lookbehind: true
    },
    'keyword': /\b(if|else|fn|let|when|is|use|pub|type|opaque|const|todo|assert|check|test)\b/,
    'operator': [
        /&&|\\|\|/,
        /\+|\-|\/|\*|%/, 
        /<=|>=|==|!=|<|>/, 
        /\.\./, 
        /\|>/,
        /->/ 
    ]
};
