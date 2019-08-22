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

  function actualToken() {
    return input[index].value;
  }

  function actualType() {
    return input[index].class;
  }

  function actualLine() {
    return input[index].line;
  }

  function nextToken() {
    index++;
  }

  function peekNext(ammount) {
    return ammount ? input[index + ammount] : input[index + 1]
  }

  function handleError(message) {
    let errorData = "Erro. Linha: " + actualLine() + ", Token Lido: " + actualToken() + ", Mensagem: " + message;
    console.log(errorData);
    errorLog.push(errorData);
  }

  function recovery(token, type) {
    if (type) {
      while (actualType() !== type) {
        nextToken();
      }
    } else {
      while (actualToken() !== token) {
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
    if (actualToken() == "programa") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        Consts();
        Main();
        Methods();
        if (actualToken() == "}") {
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
    if (actualToken() == "constantes") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        ConstBody();
        if (actualToken() == "}") {
          nextToken();
          return;
        }
      }
    }
  }

  function ConstBody() {
    console.log('.... .... ConstantsBody');
    if (actualToken() == "}") {
      return;
    } else {
      Type();
      nextToken();
      ConstAssignmentList();
      if (actualToken() == ";") {
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
    if (actualToken() == "=") {
      nextToken();
      VectorDeclaration();
      if (actualToken() == ",") {
        nextToken();
        ConstAssignmentList();
      }
      return;
    }
  }

  function Variables() {
    console.log('.... .... Variables');
    if (actualToken() == "variaveis") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        VariablesBody();
        if (actualToken() == "}") {
          nextToken();
          return;
        }
      }
    }
  }

  function VariablesBody() {
    console.log('.... .... .... VariablesBody');
    if (actualToken() == "}") {
      return;
    } else {
      Type();
      nextToken();
      VariablesAssignmentList();
      if (actualToken() == ";") {
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
    if (actualToken() == "=") {
      nextToken();
      VectorDeclaration();
      if (actualToken() == ",") {
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
    if (actualToken() == "metodo") {
      nextToken();
      if (actualToken() == "principal") {
        nextToken();
        MethodParams();
        if (actualToken() == ':') {
          nextToken();
          Type();
          nextToken();
          if (actualToken() == "{") {
            nextToken();
            Variables();
            Statements();
            if (actualToken() == "}") {
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
    if (actualToken() == "metodo") {
      nextToken();
      if (actualType() == IDENTIFIER) {
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
    if (actualToken() == "(") {
      nextToken();
      MethodArgList();
      if (actualToken() == ")") {
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
    if (actualToken() != ")") {
      Type();
      nextToken();
      BaseValue();
      if (actualToken() == ",") {
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
    if (actualToken() == ':') {
      nextToken();
      Type();
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        Variables();
        Statements();
        Return();
        if (actualToken() == ";") {
          nextToken();
          if (actualToken() == "}") {
            nextToken();
            return;
          }
        }
      }
    }
  }

  function Return() {
    if (actualToken() == "resultado") {
      nextToken();
      Expression();
      return;
    }
  }

  function IfStatement() {
    console.log('.... .... .... IfStatement');
    if (actualToken() == "se") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        Expression();
        if (actualToken() == ")") {
          nextToken();
          if (actualToken() == "entao") {
            nextToken();
            if (actualToken() == "{") {
              nextToken();
              Statements();
              if (actualToken() == "}") {
                nextToken();
                if (actualToken() == "senao") {
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
    if (actualToken() == "senao" && peekNext().value == "see") {
      nextToken();
      if (actualToken() == "se") {
        nextToken();
        if (actualToken() == "(") {
          nextToken();
          Expression();
          if (actualToken() == ")") {
            nextToken();
            if (actualToken() == "entao") {
              nextToken();
              if (actualToken() == "{") {
                nextToken();
                Statements();
                if (actualToken() == "}") {
                  nextToken();
                  if (actualToken() == "senao") {
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
    if (actualToken() == "senao") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        Statements();
        if (actualToken() == "}") {
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
    if (actualToken() == "enquanto") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        Expression();
        if (actualToken() == ")") {
          nextToken();
          if (actualToken() == "{") {
            nextToken();
            Statements();
            if (actualToken() == "}") {
              return;
            }
          }
        }
      }
    }
  }

  function Write() {
    console.log('.... .... .... Write');
    if (actualToken() == "escreva") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        ArgList();
        if (actualToken() == ")") {
          return;
        }
      }
    }
  }

  function Read() {
    console.log('.... .... .... Read');
    if (actualToken() == "leia") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        GeneralIdentifierList();
        if (actualToken() == ")") {
          return;
        }
      }
    }
  }

  function Type() {
    console.log('.... .... .... Type');
    if (actualToken() == "inteiro" || actualToken() == "real" || actualToken() == "texto" || actualToken() == "boleano" || actualToken() == "vazio" || actualType() == IDENTIFIER) {
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
    if (actualType() == RELATIONAL_OPERATOR || actualType() == LOGICAL_OPERATOR) {
      nextToken();
      Expression();
      return;
    }
    return;
  }

  function AddExpression() {
    MultExpression();
    if (actualToken() == "+" || actualToken() == "-") {
      nextToken();
      AddExpression();
      return;
    }
    return;
  }

  function MultExpression() {
    NegateExpression();
    if (actualToken() == "*" || actualToken() == "/") {
      nextToken();
      NegateExpression();
      return;
    }
    return;
  }

  function NegateExpression() {
    if (actualToken() == "-") {
      nextToken();
      Value();
      return;
    } else {
      Value();
      return;
    }
  }

  function Value() {
    if (actualToken() == "(") {
      nextToken();
      Expression();
      if (actualToken() == ")") {
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
    if (actualType() == STRING_LITERAL || actualToken() == "vazio" || actualToken() == "verdadeiro" || actualToken() == "falso") {
      nextToken();
      return;
    } else {
      Number();
      return;
    }
  }

  function Number() {
    if (actualToken() == "++" || actualToken() == "--") {
      nextToken();
      NumberLiteral();
      return;
    } else {
      NumberLiteral();
      if (actualToken() == "++" || actualToken() == "--") {
        nextToken();
        return;
      } else {
        return;
      }
    }
  }

  function NumberLiteral() {
    if (actualType() == NUMBER) {
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
    if (actualToken() == ".") {
      nextToken();
      GeneralIdentifier();
      return;
    }
    return;
  }

  function GeneralIdentifierList() {
    console.log('.... .... .... .... .... GeneralIndetifierList');
    GeneralIdentifier();
    if (actualToken() == ",") {
      nextToken();
      GeneralIdentifierList();
    }
    return;
  }

  function Params() {
    if (actualToken() == "(") {
      nextToken();
      ArgList();
      if (actualToken() == ")") {
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
    if (actualToken() == ")") {
      return;
    } else {
      BaseValue();
      if (actualToken() == ",") {
        nextToken();
        ArgList();
      }
      return;
    }
  }

  function OptionalVector() {
    console.log('.... .... .... .... .... OptionalVector');
    if (actualType() == IDENTIFIER) {
      nextToken();
      VectorIndex();
      return;
    } else {
      let errorMessage = "Recebido tipo não esperado: " + actualType();
      handleError(errorMessage);
      recovery(";");
      return;
    }
  }

  function VectorIndex() {
    console.log('.... .... .... .... .... .... VectorIndex');
    if (actualToken() == "[") {
      nextToken();
      Expression();
      if (actualToken() == "]") {
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
    if (actualToken() == "[") {
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
    if (actualToken() == "se") {
      IfStatement();
      Statements();
      // Acredito que existem problemas com o IfElse e o Else
      // possivel problema: esta faltando nextToken
      return;
    } else if (actualToken() == "enquanto") {
      WhileStatement();
      nextToken();
      Statements();
      return;
    } else if (actualToken() == "leia") {
      Read();
      nextToken();
      if (actualToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else if (actualToken() == "escreva") {
      Write();
      nextToken();
      if (actualToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      Statements();
      return;
    } else if (actualType() == IDENTIFIER) {
      let lookahead = peekNext();
      if (lookahead.value == "=") {
        Assignment();
        if (actualToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
        Statements();
        return;
      } else {
        Expression();
        if (actualToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
        Statements();
        return;
      }
    } else if (actualType() == STRING_LITERAL || actualType() == NUMBER) {
      Expression();
      if (actualToken() == ";") {
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
    if (actualToken() == "=") {
      nextToken();
      Expression();
      return;
    }
  }

  return {
    Start
  }
}