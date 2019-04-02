const lexical = {
  IDENTIFIER: /^([a-z]|[A-Z]){1}([a-z]|[A-Z]|[0-9]|_)*/,
  RESERVED_WORD: /(^programa$|^constantes$|^variaveis$|^metodo$|^resultado$|^principal$|^se$|^entao$|^senao$|^enquanto$|^leia$|^escreva$|^vazio$|^inteiro$|^real$|^boleano$|^texto$|^verdadeiro$|^falso$)/,
  NUMBER: /^\-?\s*[0-9]+(\.[0-9]+)?$/,
  ARITHMETIC_OPERATION: /(^\+$|^\-$|^\*$|^\/$|^\+\+$|^\-\-$)/,
  RELATIONAL_OPERATION: /(^\!\=$|^\=\=$|^<$|^<\=$|^>$|^>\=$|^=$)/,
  LOGIC_OPERATION: /(^\!$|^&&$|^\|\|$)/,
  LINE_COMMENT: /^\/\//,
  BLOCK_COMMENT: /^\/\*.+\*\/$/m,
  DELIMITER: /(^;$|^,$|^\($|^\)$|^\[$|^\]$|^\{$|^\}$|^\.$)/,
  CHARACTER_SEQUENCE: /^(?!.*\\\"$)(\"([^\"]|\\\")*\")$/
};

const errors = {
  UNDEFINED_LEXEME: /.*/,
  MALFORMED_NUMBER: /^\-?\s*[0-9]+(\..*[^0-9]+.*$|.*[^0-9\.]+.*|\.$)/,
  MALFORMED_SEQUENCE: /^(?![^\\]*\"$)(\".*)$/m,
  MALFORMED_COMMENT: /^(?!.*\*\/$)(\/\*.*)$/m,
  MALFORMED_IDENTIFIER: /^([a-z]|[A-Z]).*[^(\w|\d|\_)].*/
};

module.exports = { lexical, errors };