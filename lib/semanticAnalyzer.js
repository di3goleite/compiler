/**
 * Structure
 * {
 *   scope: 'programa',
 *   symbols: [
 *     {
 *       class: 'const',
 *       type: 'integer',
 *       lexeme: 'a'
 *     }
 *   ]
 * }
 */
const symbolTable = [];

function exists(scope) {
  let exists = false;

  symbolTable.forEach(function(entry) {
    if (entry['scope'] === scope) {
      exists = true;
      break;
    }
  });

  return exists;
}

function insert(scope, classification, type, lexeme) {
  const entry = {
    scope: scope,
    symbols: [
      {
        class: classification,
        type: type,
        lexeme: lexeme
      }
    ]
  };

  if (symbolTable.length === 0) {
    doInsert(entry);
  } else {
    if (!exists(scope)) {
      doInsert(entry);
    } else {
      console.log('error');
    }
  }
}

function doInsert(entry) {
  symbolTable.push(entry);
  console.log(symbolTable);
}

module.exports = { insert };