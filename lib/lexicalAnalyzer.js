const lexicalStructure = require('./../common/lexicalStructure');
const regularExpressions = require('./../common/regularExpressions');

// Remove empty spaces, block commands and \r windows character
function cleanUp(str) {
  const numberRegex = regularExpressions.lexical.NUMBER;

  let isANegativeNumber = false;
  let isALineComment = false;
  let isABlockComment = false;

  let list = [];
  let numberOfLines = 1;
  let errorStartLine = 0;

  let output = '';
  let blockCommentBuffer = '';

  for (let i = 0; i < str.length; i++) {
    if (!isANegativeNumber && !isALineComment && !isABlockComment) {
      if (str[i] !== ' ' && str[i] !== '\t' && str[i] !== '\n' && str[i] !== '\r') {
        if (str[i] === '/' && str[i + 1] === '/') {
          isALineComment = true;
        } else if (str[i] === '/' && str[i + 1] === '*') {
          isABlockComment = true;
          errorStartLine = numberOfLines;
          blockCommentBuffer = blockCommentBuffer + str[i];
        } else {
          output = output + str[i];
        }
      } else if (i > 0 && str[i - 1] === '-') {
        isANegativeNumber = true;
        output = output + str[i];
      }
    } else if (isANegativeNumber) {
      if (!(str[i] === ' ' || numberRegex.test(str[i]))) {
        isANegativeNumber = false;
      }
      output = output + str[i];
    } else if (isALineComment) {
      if (str[i] === '\n') {
        isALineComment = false;
      }
    } else if (isABlockComment) {
      blockCommentBuffer = blockCommentBuffer + str[i];

      if (str[i] === '*' && str[i + 1] === '/') {
        isABlockComment = false;
        blockCommentBuffer = '';
        errorStartLine = 0;
        i = i + 1;
      } else if(i + 1 >= str.length) {
        output = output + blockCommentBuffer;
        blockCommentBuffer = '';
      }
    }

    // Save each line with its respective number
    if ((str[i] === ' ' || str[i] === '\t') && !isANegativeNumber &&
      !isALineComment && !isABlockComment) {
      if (output !== '') {
        list.push({line: numberOfLines, value: output});
        output = '';
      }
    } else if (str[i] === '\n') {
      if (output !== '') {
        list.push({line: numberOfLines, value: output});
        output = '';
      }

      numberOfLines = numberOfLines + 1;
    }
  }

  return list;
}

// Do split based on regular expressions
function split(list) {
  const categories = lexicalStructure.categories;
  let auxList = [];
  let parts = [];
  let regex = '';

  Object.keys(categories).forEach(function(category) {
    categories[category].forEach(function(c) {
      regex = new RegExp('(?<=' + c + ')|(?=' + c + ')');

      for (let i = 0; i < list.length; i++) {
        parts = list[i]['value'].split(regex);

        if (parts.length > 1) {
          parts = parts.map(function(part) {
            return {line: list[i]['line'], value: part};
          });

          auxList = list.slice(0, i);
          auxList = auxList.concat(parts);
          auxList = auxList.concat(list.slice(i + 1, list.length));
          list = auxList;
        }
      }
    });
  });

  return list;
}

// Apply special rules described for this lexical analyzer
function bandaid(list) {
  const arithmeticOperationRegex = regularExpressions.lexical.ARITHMETIC_OPERATION;
  const relationalOperationRegex = regularExpressions.lexical.RELATIONAL_OPERATION;
  const numberRegex = regularExpressions.lexical.NUMBER;

  let output = [];
  let charactersChain = '';
  let errorStartLine = 1;

  for (let i = 0; i < list.length; i++) {
    // Positive Number
    if (numberRegex.test(list[i]['value'])) {
      // Float number
      if (i+1 < list.length && list[i+1]['value'] === '.') {
        // Float part of float number
        if (i+2 < list.length && numberRegex.test(list[i+2]['value'])) {
          output.push({
            line: list[i]['line'],
            value: (list[i]['value'].concat(list[i+1]['value'])).concat(list[i+2]['value'])
          });
          i = i + 2;
        } else {
          output.push({
            line: list[i]['line'],
            value: list[i]['value'].concat(list[i+1]['value'])
          });
          i = i + 1;
        }
      // Integer number
      } else {
        output.push({line: list[i]['line'], value: list[i]['value']});
      }

    // Negative Number or Arithmetic Operation?
    } else if (list[i]['value'] === '-') {
      // Arithmetic Operation
      if (i > 0 && numberRegex.test(list[i-1]['value'])) {
        output.push({line: list[i]['line'], value: list[i]['value']});
      // Negative Number
      } else {
        if (numberRegex.test(list[i+1]['value'])) {
          // Float negative number
          if (i+2 < list.length && list[i+2]['value'] === '.') {
            // Float part of float negative number
            if (i+3 < list.length && numberRegex.test(list[i+3]['value'])) {
              output.push({
                line: list[i]['line'],
                value: ((list[i]['value'].concat(list[i+1]['value'])).concat(list[i+2]['value'])).concat(list[i+3]['value'])
              });
              i = i + 3;
            } else {
              output.push({
                line: list[i]['line'],
                value: (list[i]['value'].concat(list[i+1]['value'])).concat(list[i+2]['value'])
              });
              i = i + 2;
            }
          // Integer negative number
          } else {
            output.push({line: list[i]['line'], value: list[i]['value'].concat(list[i+1]['value'])});
            i = i + 1;
          }
        } else {
          output.push({line: list[i]['line'], value: list[i]['value'].concat(list[i+1]['value'])});
          i = i + 1;
        }
      }

    // Characters chain special condition
    } else if (list[i]['value'].indexOf('\"') === 0) {
      errorStartLine = list[i]['line'];
      charactersChain = '';

      while (i < list.length) {
        charactersChain = charactersChain + list[i]['value'];

        if (list[i]['value'][list[i]['value'].length-1] === '\"') {
          break;
        } else {
          i = i + 1;
        }
      }

      output.push({line: errorStartLine, value: charactersChain});

    // Block comment special condition error
    } else if (i+1 < list.length && list[i]['value'] === '/' && list[i+1]['value'] === '*') {
      errorStartLine = list[i]['line'];
      charactersChain = '';

      while (i < list.length) {
        charactersChain = charactersChain + list[i]['value'];
        i = i + 1;
      }

      output.push({line: errorStartLine, value: charactersChain});

    // Arithmetic operator special condition
    } else if (i+1 < list.length && arithmeticOperationRegex.test(list[i]['value']) && arithmeticOperationRegex.test(list[i+1]['value'])) {
      output.push({line: list[i]['line'], value: list[i]['value'].concat(list[i+1]['value'])});
      i = i + 1;

    // Relational operator special condition
    } else if (i+1 < list.length && (relationalOperationRegex.test(list[i]['value']) && relationalOperationRegex.test(list[i+1]['value'])) || (list[i]['value'] === '!' && list[i+1]['value'] === '=')) {
      output.push({line: list[i]['line'], value: list[i]['value'].concat(list[i+1]['value'])});
      i = i + 1;

    // Default
    } else {
      output.push({line: list[i]['line'], value: list[i]['value']});
    }
  }

  return output;
}

module.exports = { cleanUp, split, bandaid };