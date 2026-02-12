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

  // Strings (double-quoted with escape sequences)
  'string': {
    pattern: /@?"(?:\\.|[^"\\])*"/,
    greedy: true
  },

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

  // Type names (PascalCase identifiers)
  'inserted': /\b[A-Z][a-zA-Z0-9_]*\b/,

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
