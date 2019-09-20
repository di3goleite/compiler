module.exports = (input) => {
  var index = 0;

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
    debugger;
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
    debugger;
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
    GeneralIdentifier();
    if (currentToken() == "=") {
      nextToken();
      Expression();
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

  function MultExpression() {
    NegateExpression();
    if (currentToken() == "*" || currentToken() == "/") {
      nextToken();
      NegateExpression();
      return;
    }
    return;
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
        Statements();
        return;
      } else {
        Expression();
        if (currentToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
        Statements();
        return;
      }
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