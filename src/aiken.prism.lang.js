// Prism language definition for Aiken
Prism.languages.aiken = {
  'comment': {
    pattern: /\/\/.*/,
    greedy: true
  },

  'string': [
    {
      pattern: /"(?:\\.|[^"\\])*"/,
      greedy: true
    },
    {
      // Byte array literals: #"hex"
      pattern: /#"(?:[0-9a-fA-F])*"/,
      greedy: true
    }
  ],

  // Must come before class-name to take precedence
  'boolean': /\b(?:True|False)\b/,

  'number': [
    /\b0b[01]+\b/,
    /\b0o[0-7]+\b/,
    /\b0x[\da-fA-F]+\b/,
    /\b\d[\d_]*(?:\.\d*)?\b/
  ],

  'keyword': /\b(?:if|else|when|is|fn|use|let|pub|type|opaque|const|todo|expect|test|bench|trace|fail|validator|and|or|as|via)\b/,

  // e.g. `module_name.` before a function or type
  'namespace': /\b[a-z_][a-zA-Z0-9_]*\b(?=\.)/,

  'class-name': /\b[A-Z][a-zA-Z0-9_]*\b/,

  'function': /\b[a-z_][a-zA-Z0-9_]*(?=\s*\()/,

  'operator': [
    /\?/,
    /->|<-/,
    /\|>/,
    /\.\./,
    /<=|>=|==|!=|<|>/,
    /&&|\|\|/,
    /[+\-*/%]/,
    /=/,
    /\|/
  ],

  'punctuation': /[{}[\](),.:]/
};

Prism.languages.ak = Prism.languages.aiken;
