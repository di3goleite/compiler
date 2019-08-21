const categories = {
  RESERVED_WORDS: ['programa', 'constantes', 'variaveis', 'metodo', 'resultado', 'principal', 'se', 'entao', 'senao', 'enquanto', 'leia', 'escreva', 'vazio', 'inteiro', 'real', 'boleano', 'texto', 'verdadeiro', 'falso'],
  ARITHMETIC_OPERATORS: ['\\+', '\\-', '\\*', '\\/', '\\+\\+', '\\-\\-'],
  RELATIONAL_OPERATORS: ['!=', '==', '<', '<=', '>', '>=', '='],
  LOGIC_OPERATORS: ['\\!', '\\&\\&', '\\|\\|'],
  DELIMITERS: ['\:', '\;', '\,', '\\(', '\\)', '\\[', '\\]', '\\{', '\\}', '\\.']
};

module.exports = { categories };