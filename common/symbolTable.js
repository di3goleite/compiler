const semanticAnalyzer = require('../lib/semanticAnalyzer');

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
function createScopeAndInsertSymbol(scope, symbol) {
  symbolTable.push({ scope: scope, symbols: [symbol] });
}

function insertSymbolForExistingScope(index, symbol) {
  symbolTable[index]['symbols'].push(symbol);
}

function searchScope(scope) {
  for (let i=0; i < symbolTable.length; i++) {
    if (symbolTable[i]['scope'] === scope) {
      return i;
    }
  }
  return -1;
}

function searchSymbol(scopeIndex, symbolId) {
  if (scopeIndex > - 1 && scopeIndex <= symbolTable.length - 1) {
    const scopeSymbols = symbolTable[scopeIndex]['symbols'];

    for (let i=0; i < scopeSymbols.length; i++) {
      if (scopeSymbols[i]['id'] === symbolId) {
        return true;
      }
    }
  }

  return false;
}

function deepSearchSymbol(symbolId) {
  for (let i=0; i < symbolTable.length; i++) {
    for (let j=0; j < symbolTable[i]['symbols'].length; j++) {
      if (symbolTable[i]['symbols'][j]['id'] === symbolId) {
        return symbolTable[i]['symbols'][j];
      }
    }
  }
  return null;
}

function insert(scope, classification, type, id, line) {
  const symbol = {
    class: classification,
    type: type,
    id: id
  };

  const index = searchScope(scope);
  const GLOBAL_SCOPE_INDEX = 0;

  if (index > -1) {
    // do only for global scope
    if (scope === 'programa') {
      if (!searchSymbol(GLOBAL_SCOPE_INDEX, symbol['id'])) {
        insertSymbolForExistingScope(GLOBAL_SCOPE_INDEX, symbol);
      } else {
        let error = `Linha: ${line}: O Símbolo ${symbol['id']}[${symbol['type']}] do escopo ${scope} já existe no escopo GLOBAL`;
        semanticAnalyzer.insert(error);
      }
    // do for global and local scope
    } else {
      // global scope
      if (!searchSymbol(GLOBAL_SCOPE_INDEX, symbol['id'])) {
        // local scope
        if (!searchSymbol(index, symbol['id'])) {
          insertSymbolForExistingScope(index, symbol);
        } else {
          let error = `Linha: ${line}: O Símbolo ${symbol['id']}[${symbol['type']}] do escopo ${scope} já existe no escopo ${scope}`;
          semanticAnalyzer.insert(error);
        }
      } else {
        let error = `Linha: ${line}: O Símbolo ${symbol['id']}[${symbol['type']}] do escopo ${scope} já existe no escopo GLOBAL`;
        semanticAnalyzer.insert(error);
      }
    }
  } else {
    if (scope === 'programa') {
      createScopeAndInsertSymbol(scope, symbol);
    } else {
      if (!searchSymbol(GLOBAL_SCOPE_INDEX, symbol['id'])) {
        createScopeAndInsertSymbol(scope, symbol);
      } else {
        let error = `Linha: ${line}: O Símbolo ${symbol['id']}[${symbol['type']}] do escopo ${scope} já existe no escopo GLOBAL`;
        semanticAnalyzer.insert(error);
      }
    }
  }
}

function get() {
  return symbolTable;
}

module.exports = { insert, get, searchSymbol, searchScope, deepSearchSymbol };