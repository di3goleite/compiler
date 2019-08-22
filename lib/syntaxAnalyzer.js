module.exports = (input) => {
  var index = 0;

  const NUMBER = "NUMBER";
  const STRING_LITERAL = "CHARACTER_SEQUENCE";
  const IDENTIFIER = "IDENTIFIER";
  const ARITHMETIC_OPERATOR = "ARITHMETIC_OPERATION";
  const RELATIONAL_OPERATOR = "RELATIONAL_OPERATION";
  const LOGICAL_OPERATOR = "LOGIC_OPERATION";
  const DELIMITER = "DELIMITER";
  const RESERVED_WORD = "RESERVED_WORD";
  const BOOL_LITERAL = "BOOLEAN_LITERAL"

  var errorLog = [];

  function currentToken() {
    return input[index].value;
  }

  function currentType() {
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
      while (currentType() !== type) {
        nextToken();
      }
    } else {
      while (currentToken() !== token) {
        nextToken();
      }
    }
  }

  function Start() {
    Program();
    return errorLog;
  }

  function Program() {
    console.log('Program');
    if (currentToken() == "programa") {
      nextToken();
      if (currentToken() == "{") {
        nextToken();
        Consts();
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

  function Consts() {
    console.log('.... Constants');
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
    }
  }

  function ConstBody() {
    console.log('.... .... ConstantsBody');
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
    console.log('.... .... .... ConstantsAssignmentList');
    GeneralIdentifier();
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

  function Variables() {
    console.log('.... .... Variables');
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
    }
  }

  function VariablesBody() {
    console.log('.... .... .... VariablesBody');
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
    console.log('.... .... .... .... VariablesAssignmentList');
    GeneralIdentifierList();
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

  function Main() {
    console.log('.... Main');
    if (currentToken() == "metodo") {
      nextToken();
      if (currentToken() == "principal") {
        nextToken();
        MethodParams();
        if (currentToken() == ':') {
          nextToken();
          Type();
          nextToken();
          if (currentToken() == "{") {
            nextToken();
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
    console.log('.... Methods');
    if (currentToken() == "metodo") {
      nextToken();
      if (currentType() == IDENTIFIER) {
        nextToken();
        MethodParams();
        FunctionBody();
        Methods();
        return;
      } else {
        let errorMessage = "Assinatura do método inválida";
        handleError(errorMessage);
        recovery("{");
        FunctionBody();
        Methods();
      }
      nextToken();
    }
  }

  function MethodParams() {
    console.log('.... .... MethodParams');
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
    console.log('.... .... .... MethodArgumentsList');
    if (currentToken() != ")") {
      Type();
      nextToken();
      BaseValue();
      if (currentToken() == ",") {
        nextToken();
        MethodArgList();
      }
      return;
    } else {
      return;
    }
  }

  function FunctionBody() {
    console.log('.... .... FunctionBody');
    if (currentToken() == ':') {
      nextToken();
      Type();
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
    console.log('.... .... .... Return');
    if (currentToken() == "resultado") {
      nextToken();
      Expression();
      return;
    }
  }

  function IfStatement() {
    console.log('.... .... .... IfStatement');
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
    console.log('.... .... .... .... ElseIfStatement');
    if (currentToken() == "senao" && peekNext().value == "see") {
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
    console.log('.... .... .... .... ElseStatement');
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
    console.log('.... .... .... WhileStatement');
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

  function Write() {
    console.log('.... .... .... Write');
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

  function Read() {
    console.log('.... .... .... Read');
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

  function Type() {
    console.log('.... .... .... Type');
    if (currentToken() == "inteiro" || currentToken() == "real" || currentToken() == "texto" || currentToken() == "boleano" || currentToken() == "vazio" || currentType() == IDENTIFIER) {
      return;
    } else {
      let errorMessage = "Tipo de variável não reconhecido";
      handleError(errorMessage);
      return;
    }
  }

  function Expression() {
    console.log('.... .... .... .... .... Expression');
    AddExpression();
    if (currentType() == RELATIONAL_OPERATOR || currentType() == LOGICAL_OPERATOR) {
      nextToken();
      Expression();
      return;
    }
    return;
  }

  function AddExpression() {
    console.log('.... .... .... .... .... .... AddExpression');
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
    console.log('.... .... .... .... BaseValue');
    if (currentType() == STRING_LITERAL || currentToken() == "vazio" || currentToken() == "verdadeiro" || currentToken() == "falso") {
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
    if (currentType() == NUMBER) {
      nextToken();
      return;
    } else {
      GeneralIdentifier();
      return;
    }
  }

  function GeneralIdentifier() {
    console.log('.... .... .... .... GeneralIdentifier');
    OptionalVector();
    Params();
    if (currentToken() == ".") {
      nextToken();
      GeneralIdentifier();
      return;
    }
    return;
  }

  function GeneralIdentifierList() {
    console.log('.... .... .... .... .... GeneralIndetifierList');
    GeneralIdentifier();
    if (currentToken() == ",") {
      nextToken();
      GeneralIdentifierList();
    }
    return;
  }

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
    console.log('.... .... .... .... ArgumentsList');
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

  function OptionalVector() {
    console.log('.... .... .... .... .... OptionalVector');
    if (currentType() == IDENTIFIER) {
      nextToken();
      VectorIndex();
      return;
    } else {
      let errorMessage = "Recebido tipo não esperado: " + currentType();
      handleError(errorMessage);
      recovery(";");
      return;
    }
  }

  function VectorIndex() {
    console.log('.... .... .... .... .... .... VectorIndex');
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
    console.log('.... .... .... .... VectorDeclaration');
    if (currentToken() == "[") {
      nextToken();
      VectorDeclaration();
      return;
    } else {
      Expression();
      return;
    }

  }

  function Statements() {
    console.log('.... .... Statements');
    if (currentToken() == "se") {
      IfStatement();
      Statements();
      // Acredito que existem problemas com o IfElse e o Else
      // possivel problema: esta faltando nextToken
      return;
    } else if (currentToken() == "enquanto") {
      WhileStatement();
      nextToken();
      Statements();
      return;
    } else if (currentToken() == "leia") {
      Read();
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
      Write();
      nextToken();
      if (currentToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else if (currentType() == IDENTIFIER) {
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
    } else if (currentType() == STRING_LITERAL || currentType() == NUMBER) {
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

  function Assignment() {
    GeneralIdentifier();
    if (currentToken() == "=") {
      nextToken();
      Expression();
      return;
    }
  }

  return {
    Start
  }
}