/**
 * Prism language definition for Aiken
 * Converted from aiken.tmLanguage.json (https://github.com/aiken-lang/site/blob/main/aiken.tmLanguage.json)
 */

Prism.languages.aiken = {
  // Comments (single-line only)
  'comment': {
    pattern: /\/\/.*/,
    greedy: true
  },

  // Strings (double-quoted with escape sequences, and byte array literals)
  'string': [
    {
      pattern: /"(?:\\.|[^"\\])*"/,
      greedy: true
    },
    {
      // Byte array literals: #"hex content"
      pattern: /#"(?:[0-9a-fA-F])*"/,
      greedy: true
    }
  ],

  // Booleans (must come before class-name to take precedence)
  'boolean': /\b(?:True|False)\b/,

  // Numbers
  'number': [
    // Binary
    /\b0b[01]+\b/,
    // Octal
    /\b0o[0-7]+\b/,
    // Hexadecimal
    /\b0x[\da-fA-F]+\b/,
    // Decimal (with optional decimal point)
    /\b\d[\d_]*(?:\.\d*)?\b/
  ],

  // Keywords
  'keyword': /\b(?:if|else|when|is|fn|use|let|pub|type|opaque|const|todo|expect|test|bench|trace|fail|validator|and|or|as|via)\b/,

  // Module namespace qualifiers (e.g. `module_name.` before a function or type)
  'namespace': /\b[a-z_][a-zA-Z0-9_]*\b(?=\.)/,

  // Type names (PascalCase identifiers)
  'class-name': /\b[A-Z][a-zA-Z0-9_]*\b/,

  // Function calls
  'function': /\b[a-z_][a-zA-Z0-9_]*(?=\s*\()/,

  // Operators
  'operator': [
    // Trace operator
    /\?/,
    // Arrow operators
    /->|<-/,
    // Pipe operator
    /\|>/,
    // Spread/splat
    /\.\./,
    // Comparison
    /<=|>=|==|!=|<|>/,
    // Logical
    /&&|\|\|/,
    // Arithmetic
    /[+\-*/%]/,
    // Assignment
    /=/,
    // Pipe/union
    /\|/
  ],

  // Punctuation
  'punctuation': /[{}[\](),.:]/
};

// Aliases
Prism.languages.ak = Prism.languages.aiken;
