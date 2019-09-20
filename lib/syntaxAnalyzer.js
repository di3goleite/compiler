module.exports = (input) => {
  let index = 0;
  const GLOBAL_SCOPE_INDEX = 0;

  const NUMBER = "NUMBER";
  const STRING_LITERAL = "CHARACTER_SEQUENCE";
  const IDENTIFIER = "IDENTIFIER";
  const RELATIONAL_OPERATOR = "RELATIONAL_OPERATION";
  const LOGICAL_OPERATOR = "LOGIC_OPERATION";

  const symbolTable = require('../common/symbolTable');
  const semanticAnalyzer = require('./semanticAnalyzer');

  // UTIL VARIABLES - BEGIN
  let errorLog = [];

  let currentType = '';
  let currentId = '';
  let currentMethodId = '';
  let currentScope = '';
  let currentAssignmentType = '';
  let currentAssignmentId = '';
  let isAssignmentHappening = false;
  // UTIL VARIABLES - END

  // UTIL FUNCTIONS - BEGIN
  function currentToken() {
    return input[index].value;
  }

  function currentClass() {
    return input[index].class;
  }

  function currentLine() {
    return input[index].line;
  }

  function nextToken() {
    index++;
  }

  function peekNext(ammount) {
    return ammount ? input[index + ammount] : input[index + 1]
  }

  function handleError(message) {
    let errorData = "Erro. Linha: " + currentLine() + ", Token Lido: " + currentToken() + ", Mensagem: " + message;
    console.log(errorData);
    errorLog.push(errorData);
  }

  function recovery(token, type) {
    if (type) {
      while (currentClass() !== type) {
        nextToken();
      }
    } else {
      while (currentToken() !== token) {
        nextToken();
      }
    }
  }
  // UTIL FUNCTIONS - END

  // BOOTSTRAP - BEGIN
  function Start() {
    Program();
    return errorLog;
  }

  function Program() {
    if (currentToken() == "programa") {
      nextToken();
      if (currentToken() == "{") {
        currentScope = 'programa';
        nextToken();
        Constants();
        Main();
        Methods();
        if (currentToken() == "}") {
          nextToken();
          return;
        }
      }
    } else {
      let errorMessage = "Palavra reservada programa não encontrada";
      handleError(errorMessage);
    }
  }
  // BOOTSTRAP - END

  // PRIMITIVE TYPES - BEGIN
  function Type() {
    if (currentToken() == "inteiro" || currentToken() == "real" || currentToken() == "texto" || currentToken() == "boleano" || currentToken() == "vazio" || currentClass() == IDENTIFIER) {
      currentType = currentToken();
      return;
    } else {
      let errorMessage = "Tipo de variável não reconhecido";
      handleError(errorMessage);
      return;
    }
  }

  function Value() {
    if (currentToken() == "(") {
      nextToken();
      Expression();
      if (currentToken() == ")") {
        nextToken();
        return;
      }
    } else {
      BaseValue();
      return;
    }
  }

  function BaseValue() {
    if (currentClass() == STRING_LITERAL || currentToken() == "vazio" || currentToken() == "verdadeiro" || currentToken() == "falso") {
      if (isAssignmentHappening) {
        var errorType = null;

        if (currentClass() === STRING_LITERAL && currentAssignmentType !== 'texto') {
          errorType = 'texto';
        } else if (currentToken() === "vazio" && currentAssignmentType !== 'vazio') {
          errorType = 'vazio';
        } else if ((currentToken() == "verdadeiro" || currentToken() == "falso") && currentAssignmentType !== 'boleano') {
          errorType = 'boleano';
        }

        if (errorType) {
          const error = `Linha: ${currentLine()}: Atribuição inválida. Tipo de símbolo de origem [${currentToken()}][${errorType}] diferente do de destino.`;
          semanticAnalyzer.insert(error);
        }
      }

      nextToken();
      return;
    } else {
      Number();
      return;
    }
  }

  function Number() {
    if (currentToken() == "++" || currentToken() == "--") {
      nextToken();
      NumberLiteral();
      return;
    } else {
      NumberLiteral();
      if (currentToken() == "++" || currentToken() == "--") {
        nextToken();
        return;
      } else {
        return;
      }
    }
  }

  function NumberLiteral() {
    if (currentClass() == NUMBER) {
      console.log('NUMBER', currentToken());

      if (isAssignmentHappening) {
        var errorType = null;

        if (/^\-?\s*[0-9]+$/.test(currentToken()) && currentAssignmentType !== 'inteiro') {
          errorType = 'inteiro';
        } else if (/^\-?\s*[0-9]+\.[0-9]+$/.test(currentToken()) && currentAssignmentType !== 'real') {
          errorType = 'real';
        }

        if (errorType) {
          const error = `Linha: ${currentLine()}: Atribuição inválida. Tipo de símbolo de origem [${currentToken()}][${errorType}] diferente do de destino.`;
          semanticAnalyzer.insert(error);
        }
      }
      nextToken();
      return;
    } else {
      GeneralIdentifier();
      return;
    }
  }
  // PRIMITIVE TYPES - END

  // CONSTANTS - BEGIN
  function Constants() {
    if (currentToken() == "constantes") {
      nextToken();
      if (currentToken() == "{") {
        nextToken();
        ConstBody();
        if (currentToken() == "}") {
          nextToken();
          return;
        }
      }
    } else {
      let errorMessage = "Bloco obrigatório de constantes não encontrado";
      handleError(errorMessage);
    }
  }

  function ConstBody() {
    if (currentToken() == "}") {
      return;
    } else {
      Type();
      nextToken();
      ConstAssignmentList();
      if (currentToken() == ";") {
        nextToken();
        ConstBody();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
        ConstBody();
      }
    }
  }

  function ConstAssignmentList() {
    GeneralIdentifier();
    symbolTable.insert(currentScope, 'const', currentType, currentId, currentLine());
    if (currentToken() == "=") {
      nextToken();
      VectorDeclaration();
      if (currentToken() == ",") {
        nextToken();
        ConstAssignmentList();
      }
      return;
    }
  }
  // CONSTANTS - END

  // VECTOR - BEGIN
  function OptionalVector() {
    if (currentClass() == IDENTIFIER) {
      if (isAssignmentHappening) {
        let currentIdData = symbolTable.deepSearchSymbol(currentToken());
        // CHECK ASSIGNMENT TYPE
        console.log('currentAssignmentType', currentAssignmentType);
        console.log('currentIdData[type]', currentIdData['type']);
        if (currentIdData['type'] !== currentAssignmentType) {
          const error = `Linha: ${currentLine()}: Atribuição inválida. Tipo de símbolo de origem [${currentIdData['id']}][${currentIdData['type']}] diferente do de destino.`;
          semanticAnalyzer.insert(error);
        }
      }

      currentId = currentToken();
      nextToken();
      VectorIndex();
      return;
    } else {
      let errorMessage = "Recebido tipo não esperado: " + currentClass();
      handleError(errorMessage);
      recovery(";");
      return;
    }
  }

  function VectorIndex() {
    if (currentToken() == "[") {
      nextToken();
      Expression();
      if (currentToken() == "]") {
        nextToken();
        VectorIndex();
        return;
      } else {
        let errorMessage = "O indíce do vetor não foi fechado propriamente";
        handleError(errorMessage);
        nextToken();
        return;
      }
    } else {
      return;
    }
  }

  function VectorDeclaration() {
    if (currentToken() == "{") {
      nextToken();
      VectorInitialization();
      return;
    } else {
      Expression();
      return;
    }

  }

  function VectorInitialization() {
    Expression();

    if (currentToken() == ",") {
      nextToken();
      VectorInitialization();
    } else if (currentToken() == "}") {
      nextToken();
      return;
    } else {
      let errorMessage = "Esperava fim de inicialização de vetor";
      handleError(errorMessage);
      nextToken();
      return;
    }
  }
  // VECTOR - END

  // METHODS - BEGIN
  function Main() {
    if (currentToken() == "metodo") {
      nextToken();
      if (currentToken() == "principal") {
        currentMethodId = 'principal';
        nextToken();
        MethodParams(); // Main have empty params list
        if (currentToken() == ':') {
          nextToken();
          Type();
          symbolTable.insert(currentScope, 'method', currentType, currentMethodId, currentLine());
          nextToken();
          if (currentToken() == "{") {
            nextToken();
            currentScope = currentMethodId;
            Variables();
            Statements();
            if (currentToken() == "}") {
              nextToken();
              return;
            }
          }
        }
      }
    }
  }

  function Methods() {
    if (currentToken() == "metodo") {
      nextToken();
      currentMethodId = currentToken();
      currentScope = currentMethodId;
      if (currentClass() == IDENTIFIER) {
        nextToken();
        MethodParams();
        MethodBody();
        Methods();
        return;
      } else {
        let errorMessage = "Assinatura do método inválida";
        handleError(errorMessage);
        recovery("(");
        MethodParams();
        MethodBody();
        Methods();
      }
      nextToken();
    }
  }

  function MethodParams() {
    if (currentToken() == "(") {
      nextToken();
      MethodArgList();
      if (currentToken() == ")") {
        nextToken();
        return;
      } else {
        let errorMessage = "Não foi encontrado o fechamento da lista de parâmetros da função";
        handleError(errorMessage);
        nextToken();
      }
    } else {
      return;
    }
  }

  function MethodArgList() {
    if (currentToken() != ")") {
      Type();
      nextToken();
      BaseValue();
      symbolTable.insert(currentScope, 'param', currentType, currentId, currentLine());
      if (currentToken() == ",") {
        nextToken();
        MethodArgList();
      }
      return;
    } else {
      return;
    }
  }

  function MethodBody() {
    if (currentToken() == ':') {
      nextToken();
      Type();
      symbolTable.insert('programa', 'method', currentType, currentMethodId, currentLine());
      nextToken();
      if (currentToken() == "{") {
        nextToken();
        Variables();
        Statements();
        Return();
        if (currentToken() == ";") {
          nextToken();
          if (currentToken() == "}") {
            nextToken();
            return;
          }
        }
      }
    }
  }

  function Return() {
    if (currentToken() == "resultado") {
      nextToken();
      Expression();
      return;
    } else {
      let errorMessage = "Retorno de metodo não encontrado";
      handleError(errorMessage);
    }
  }
  // METHODS - END

  // PARAMETERS - BEGIN
  function Params() {
    if (currentToken() == "(") {
      nextToken();
      ArgList();
      if (currentToken() == ")") {
        nextToken();
        return;
      } else {
        let errorMessage = "Não foi encontrado o fechamento da lista de parâmetros da função";
        handleError(errorMessage);
        nextToken();
      }
    } else {
      return;
    }
  }

  function ArgList() {
    if (currentToken() == ")") {
      return;
    } else {
      BaseValue();
      if (currentToken() == ",") {
        nextToken();
        ArgList();
      }
      return;
    }
  }
  // PARAMETERS - END

  // VARIABLES - BEGIN
  function GeneralIdentifier() {
    OptionalVector();
    Params();
    return;
  }

  function GeneralIdentifierList() {
    GeneralIdentifier();
    if (currentToken() == ",") {
      nextToken();
      GeneralIdentifierList();
    }
    return;
  }

  function Variables() {
    if (currentToken() == "variaveis") {
      nextToken();
      if (currentToken() == "{") {
        nextToken();
        VariablesBody();
        if (currentToken() == "}") {
          nextToken();
          return;
        }
      }
    } else {
      let errorMessage = "Bloco obrigatório de variáveis não encontrado";
      handleError(errorMessage);
    }
  }

  function VariablesBody() {
    if (currentToken() == "}") {
      return;
    } else {
      Type();
      nextToken();
      VariablesAssignmentList();
      if (currentToken() == ";") {
        nextToken();
        VariablesBody();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
        VariablesBody();
      }
    }
  }

  function VariablesAssignmentList() {
    GeneralIdentifierList();
    symbolTable.insert(currentScope, 'var', currentType, currentId, currentLine());
    if (currentToken() == "=") {
      nextToken();
      VectorDeclaration();
      if (currentToken() == ",") {
        nextToken();
        VariablesAssignmentList();
      }
      return;
    } else {
      return;
    }
  }
  // VARIABLES - END

  // ARITHMETIC OPERATIONS - BEGIN
  function Expression() {
    AddExpression();
    if (currentClass() == RELATIONAL_OPERATOR || currentClass() == LOGICAL_OPERATOR) {
      nextToken();
      Expression();
      return;
    }
    return;
  }

  function Assignment() {
    debugger;
    GeneralIdentifier();
    // procurar se existe na tabela de simbolos
    const existsGlobalScope = symbolTable.searchSymbol(GLOBAL_SCOPE_INDEX, currentId);
    const LOCAL_SCOPE_INDEX = symbolTable.searchScope(currentScope);
    const existsLocalScope = symbolTable.searchSymbol(LOCAL_SCOPE_INDEX, currentId);

    if (!existsGlobalScope && !existsLocalScope) {
      const error = `Linha: ${currentLine()}: O Símbolo ${currentId} utilizado no escopo ${currentScope} nunca foi declarado`;
      semanticAnalyzer.insert(error);
    } else {
      // se existir é só salvar o tipo da atribuição
      console.log('\n\nisAssignmentHappening --------------------------------- start');
      isAssignmentHappening = true;
      currentAssignmentId = symbolTable.deepSearchSymbol(currentId);
      currentAssignmentType = currentAssignmentId['type'];
      console.log(currentAssignmentId, currentAssignmentType);
    }

    if (currentToken() == "=") {
      nextToken();
      Expression();
      isAssignmentHappening = false;
      console.log('isAssignmentHappening --------------------------------- end\n\n');
      return;
    }
  }

  function AddExpression() {
    MultExpression();
    if (currentToken() == "+" || currentToken() == "-") {
      nextToken();
      AddExpression();
      return;
    }
    return;
  }

  function MultExpression() {
    NegateExpression();
    if (currentToken() == "*" || currentToken() == "/") {
      nextToken();
      NegateExpression();
      return;
    }
    return;
  }

  function NegateExpression() {
    if (currentToken() == "-") {
      nextToken();
      Value();
      return;
    } else {
      Value();
      return;
    }
  }
  // ARITHMETIC OPERATIONS - END

  // STATMENTS - BEGIN
  function IfStatement() {
    if (currentToken() == "se") {
      nextToken();
      if (currentToken() == "(") {
        nextToken();
        Expression();
        if (currentToken() == ")") {
          nextToken();
          if (currentToken() == "entao") {
            nextToken();
            if (currentToken() == "{") {
              nextToken();
              Statements();
              if (currentToken() == "}") {
                nextToken();
                if (currentToken() == "senao") {
                  ElseIfStatement();
                  ElseStatement();
                }
                return;
              }
            }
          }
        }
      }
    }
  }

  function ElseIfStatement() {
    if (currentToken() == "senao" && peekNext().value == "se") {
      nextToken();
      if (currentToken() == "se") {
        nextToken();
        if (currentToken() == "(") {
          nextToken();
          Expression();
          if (currentToken() == ")") {
            nextToken();
            if (currentToken() == "entao") {
              nextToken();
              if (currentToken() == "{") {
                nextToken();
                Statements();
                if (currentToken() == "}") {
                  nextToken();
                  if (currentToken() == "senao") {
                    if (peekNext(1).value == "se") {
                      ElseIfStatement();
                    }
                  }
                  return;
                }
              }
            }
          }
        }
      }
    }
  }

  function ElseStatement() {
    if (currentToken() == "senao") {
      nextToken();
      if (currentToken() == "{") {
        nextToken();
        Statements();
        if (currentToken() == "}") {
          nextToken();
          return;
        } else {
          let errorMessage = "Não foi possível encontrar fechamento para o corpo do else";
          handleError(errorMessage);
          nextToken();
          return;
        }
      }
    }
  }

  function WhileStatement() {
    if (currentToken() == "enquanto") {
      nextToken();
      if (currentToken() == "(") {
        nextToken();
        Expression();
        if (currentToken() == ")") {
          nextToken();
          if (currentToken() == "{") {
            nextToken();
            Statements();
            if (currentToken() == "}") {
              return;
            }
          }
        }
      }
    }
  }

  function WriteCommand() {
    if (currentToken() == "escreva") {
      nextToken();
      if (currentToken() == "(") {
        nextToken();
        ArgList();
        if (currentToken() == ")") {
          return;
        }
      }
    }
  }

  function ReadCommand() {
    if (currentToken() == "leia") {
      nextToken();
      if (currentToken() == "(") {
        nextToken();
        GeneralIdentifierList();
        if (currentToken() == ")") {
          return;
        }
      }
    }
  }

  function Statements() {
    if (currentToken() == "se") {
      IfStatement();
      Statements();
      return;
    } else if (currentToken() == "enquanto") {
      WhileStatement();
      nextToken();
      Statements();
      return;
    } else if (currentToken() == "leia") {
      ReadCommand();
      nextToken();
      if (currentToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else if (currentToken() == "escreva") {
      WriteCommand();
      nextToken();
      if (currentToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else if (currentClass() == IDENTIFIER) {
      let lookahead = peekNext();
      if (lookahead.value == "=") {
        Assignment();
        if (currentToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
      } else {
        Expression();
        if (currentToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
      }
      Statements();
      return;
    } else if (currentClass() == STRING_LITERAL || currentClass() == NUMBER) {
      Expression();
      if (currentToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else {
      return;
    }
  }
  // STATMENTS - END

  return {
    Start
  }
}