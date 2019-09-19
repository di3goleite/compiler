/**
 * Structure
 * {
 *   scope: 'programa',
 *   symbols: [
 *     {
 *       class: 'const',
 *       type: 'integer',
 *       id: 'a'
 *     }
 *   ]
 * }
 */
const symbolTable = [];

function search(scope) {
  for (let i=0; i < symbolTable.length; i++) {
    if (symbolTable[i]['scope'] === scope) {
      return i;
    }
  }
  return -1;
}

function insertNew(scope, symbol) {
  symbolTable.push({ scope: scope, symbols: [symbol] });
}

function insertForExisting(index, symbol) {
  symbolTable[index]['symbols'].push(symbol);
}

function insert(scope, classification, type, id) {
  const symbol = {
    class: classification,
    type: type,
    id: id
  };

  const index = search(scope);

  if (index > -1) {
    insertForExisting(index, symbol);
  } else {
    insertNew(scope, symbol);
  }

  beautifyPrint();
}

function beautifyPrint() {
  console.log('-----------------------------------------');
  console.log(JSON.stringify(symbolTable, null, 2));
}

module.exports = { insert };