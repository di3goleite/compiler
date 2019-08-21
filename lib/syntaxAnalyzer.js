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

  function receiveStart() {
    receiveProgram();
    return errorLog;
  }

  function receiveProgram() {
    console.log('Program');
    if (actualToken() == "programa") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        receiveConsts();
        receiveMain();
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

  function receiveConsts() {
    console.log('.... Constants');
    if (actualToken() == "constantes") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        receiveConstBody();
        if (actualToken() == "}") {
          nextToken();
          return;
        }
      }
    }
  }

  function receiveConstBody() {
    console.log('.... .... ConstantsBody');
    if (actualToken() == "}") {
      return;
    } else {
      receiveType();
      nextToken();
      receiveConstAssignmentList();
      if (actualToken() == ";") {
        nextToken();
        receiveConstBody();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
        receiveConstBody();
      }
    }
  }

  function receiveConstAssignmentList() {
    console.log('.... .... .... ConstantsAssignmentList');
    receiveGeneralIdentifier();
    if (actualToken() == "=") {
      nextToken();
      receiveVectorDeclaration();
      if (actualToken() == ",") {
        nextToken();
        receiveConstAssignmentList();
      }
      return;
    }
  }

  function receiveVariables() {
    console.log('.... .... Variables');
    if (actualToken() == "variaveis") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        receiveVariablesBody();
        if (actualToken() == "}") {
          nextToken();
          return;
        }
      }
    }
  }

  function receiveVariablesBody() {
    console.log('.... .... .... VariablesBody');
    if (actualToken() == "}") {
      return;
    } else {
      receiveType();
      nextToken();
      receiveVariablesAssignmentList();
      if (actualToken() == ";") {
        nextToken();
        receiveVariablesBody();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
        receiveVariablesBody();
      }
    }
  }

  function receiveVariablesAssignmentList() {
    console.log('.... .... .... .... VariablesAssignmentList');
    receiveGeneralIdentifierList();
    if (actualToken() == "=") {
      nextToken();
      receiveVectorDeclaration();
      if (actualToken() == ",") {
        nextToken();
        receiveVariablesAssignmentList();
      }
      return;
    } else {
      return;
    }
  }

  function receiveMain() {
    console.log('.... Main');
    if (actualToken() == "metodo") {
      nextToken();
      if (actualToken() == "principal") {
        nextToken();
        receiveMethodParams();
        if (actualToken() == ':') {
          nextToken();
          receiveType();
          nextToken();
          if (actualToken() == "{") {
            nextToken();
            receiveVariables();
            receiveStatements();
            // receiveMethods();
            if (actualToken() == "}") {
              return;
            }
          }
        }
      }
    }
  }

  function receiveMethods() {
    if (actualToken() == "metodo") {
      nextToken();
      if (actualType() == IDENTIFIER) {
        nextToken();
        receiveMethodParams();
        receiveFunctionBody();
        receiveMethods();
        return;
      } else {
        let errorMessage = "Assinatura do método inválida";
        handleError(errorMessage);
        recovery("{");
        receiveFunctionBody();
        receiveMethods();
      }
      nextToken();
    }
  }

  function receiveMethodParams() {
    console.log('.... .... MethodParams');
    if (actualToken() == "(") {
      nextToken();
      receiveMethodArgList();
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

  function receiveMethodArgList() {
    console.log('.... .... .... MethodArgumentsList');
    if (actualToken() != ")") {
      receiveType();
      nextToken();
      receiveBaseValue();
      if (actualToken() == ",") {
        nextToken();
        receiveMethodArgList();
      }
      return;
    } else {
      return;
    }
  }

  function receiveFunctionBody() {
    if (actualToken() == "{") {
      nextToken();
      receiveVariables();
      receiveStatements();
      receiveReturn();
      if (actualToken() == ";") {
        nextToken();
        if (actualToken() == "}") {
          nextToken();
          return;
        }
      }
    }
  }

  function receiveReturn() {
    if (actualToken() == "resultado") {
      nextToken();
      receiveExpression();
      return;
    }
  }

  function receiveIfStatement() {
    console.log('.... .... .... IfStatement');
    if (actualToken() == "se") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        receiveExpression();
        if (actualToken() == ")") {
          nextToken();
          if (actualToken() == "entao") {
            nextToken();
            if (actualToken() == "{") {
              nextToken();
              receiveStatements();
              if (actualToken() == "}") {
                nextToken();
                if (actualToken() == "senao") {
                  receiveElseIfStatement();
                  receiveElseStatement();
                }
                return;
              }
            }
          }
        }
      }
    }
  }

  function receiveElseIfStatement() {
    console.log('.... .... .... .... ElseIfStatement');
    if (actualToken() == "senao" && peekNext().value == "see") {
      nextToken();
      if (actualToken() == "se") {
        nextToken();
        if (actualToken() == "(") {
          nextToken();
          receiveExpression();
          if (actualToken() == ")") {
            nextToken();
            if (actualToken() == "entao") {
              nextToken();
              if (actualToken() == "{") {
                nextToken();
                receiveStatements();
                if (actualToken() == "}") {
                  nextToken();
                  if (actualToken() == "senao") {
                    if (peekNext(1).value == "se") {
                      receiveElseIfStatement();
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

  function receiveElseStatement() {
    console.log('.... .... .... .... ElseStatement');
    if (actualToken() == "senao") {
      nextToken();
      if (actualToken() == "{") {
        nextToken();
        receiveStatements();
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

  function receiveWhileStatement() {
    console.log('.... .... .... WhileStatement');
    if (actualToken() == "enquanto") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        receiveExpression();
        if (actualToken() == ")") {
          nextToken();
          if (actualToken() == "{") {
            nextToken();
            receiveStatements();
            if (actualToken() == "}") {
              return;
            }
          }
        }
      }
    }
  }

  function receiveWrite() {
    console.log('.... .... .... Write');
    if (actualToken() == "escreva") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        receiveArgList();
        if (actualToken() == ")") {
          return;
        }
      }
    }
  }

  function receiveRead() {
    console.log('.... .... .... Read');
    if (actualToken() == "leia") {
      nextToken();
      if (actualToken() == "(") {
        nextToken();
        receiveGeneralIdentifierList();
        if (actualToken() == ")") {
          return;
        }
      }
    }
  }

  function receiveType() {
    console.log('.... .... .... Type');
    if (actualToken() == "inteiro" || actualToken() == "real" || actualToken() == "texto" || actualToken() == "boleano" || actualToken() == "vazio" || actualType() == IDENTIFIER) {
      return;
    } else {
      let errorMessage = "Tipo de variável não reconhecido";
      handleError(errorMessage);
      return;
    }
  }

  function receiveExpression() {
    console.log('.... .... .... .... .... Expression');
    receiveAddExpression();
    if (actualType() == RELATIONAL_OPERATOR || actualType() == LOGICAL_OPERATOR) {
      nextToken();
      receiveExpression();
      return;
    }
    return;
  }

  function receiveAddExpression() {
    receiveMultExpression();
    if (actualToken() == "+" || actualToken() == "-") {
      nextToken();
      receiveAddExpression();
      return;
    }
    return;
  }

  function receiveMultExpression() {
    receiveNegateExpression();
    if (actualToken() == "*" || actualToken() == "/") {
      nextToken();
      receiveNegateExpression();
      return;
    }
    return;
  }

  function receiveNegateExpression() {
    if (actualToken() == "-") {
      nextToken();
      receiveValue();
      return;
    } else {
      receiveValue();
      return;
    }
  }

  function receiveValue() {
    if (actualToken() == "(") {
      nextToken();
      receiveExpression();
      if (actualToken() == ")") {
        nextToken();
        return;
      }
    } else {
      receiveBaseValue();
      return;
    }
  }

  function receiveBaseValue() {
    if (actualType() == STRING_LITERAL || actualToken() == "vazio" || actualToken() == "verdadeiro" || actualToken() == "falso") {
      nextToken();
      return;
    } else {
      receiveNumber();
      return;
    }
  }

  function receiveNumber() {
    if (actualToken() == "++" || actualToken() == "--") {
      nextToken();
      receiveNumberLiteral();
      return;
    } else {
      receiveNumberLiteral();
      if (actualToken() == "++" || actualToken() == "--") {
        nextToken();
        return;
      } else {
        return;
      }
    }
  }

  function receiveNumberLiteral() {
    if (actualType() == NUMBER) {
      nextToken();
      return;
    } else {
      receiveGeneralIdentifier();
      return;
    }
  }

  function receiveGeneralIdentifier() {
    console.log('.... .... .... .... GeneralIdentifier');
    receiveOptionalVector();
    receiveParams();
    if (actualToken() == ".") {
      nextToken();
      receiveGeneralIdentifier();
      return;
    }
    return;
  }

  function receiveGeneralIdentifierList() {
    console.log('.... .... .... .... .... GeneralIndetifierList');
    receiveGeneralIdentifier();
    if (actualToken() == ",") {
      nextToken();
      receiveGeneralIdentifierList();
    }
    return;
  }

  function receiveParams() {
    if (actualToken() == "(") {
      nextToken();
      receiveArgList();
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

  function receiveArgList() {
    console.log('.... .... .... .... ArgumentsList');
    if (actualToken() == ")") {
      return;
    } else {
      receiveBaseValue();
      if (actualToken() == ",") {
        nextToken();
        receiveArgList();
      }
      return;
    }
  }

  function receiveOptionalVector() {
    if (actualType() == IDENTIFIER) {
      nextToken();
      receiveVectorIndex();
      return;
    } else {
      let errorMessage = "Recebido tipo não esperado: " + actualType();
      handleError(errorMessage);
      recovery(";");
      return;
    }
  }

  function receiveVectorIndex() {
    if (actualToken() == "[") {
      nextToken();
      console.log("conteudo do array", actualToken())
      receiveExpression();
      console.log("fim do conteudo", actualToken())
      if (actualToken() == "]") {
        nextToken();
        receiveVectorIndex();
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

  function receiveVectorDeclaration() {
    console.log('.... .... .... .... VectorDeclaration');
    if (actualToken() == "[") {
      nextToken();
      receiveVectorDeclaration();
      return;
    } else {
      receiveExpression();
      return;
    }

  }

  function receiveStatements() {
    console.log('.... .... Statements');
    if (actualToken() == "se") {
      receiveIfStatement();
      receiveStatements();
      // Acredito que existem problemas com o IfElse e o Else
      // possivel problema: esta faltando nextToken
      return;
    } else if (actualToken() == "enquanto") {
      receiveWhileStatement();
      nextToken();
      receiveStatements();
      return;
    } else if (actualToken() == "leia") {
      receiveRead();
      nextToken();
      if (actualToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      receiveStatements();
      return;
    } else if (actualToken() == "escreva") {
      receiveWrite();
      nextToken();
      if (actualToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      receiveStatements();
      return;
    } else if (actualType() == IDENTIFIER) {
      let lookahead = peekNext();
      if (lookahead.value == "=") {
        receiveAssignment();
        if (actualToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
        receiveStatements();
        return;
      } else {
        receiveExpression();
        if (actualToken() == ";") {
          nextToken();
        } else {
          let errorMessage = "Faltando ponto-vírgula";
          handleError(errorMessage);
        }
        receiveStatements();
        return;
      }
    } else if (actualType() == STRING_LITERAL || actualType() == NUMBER) {
      receiveExpression();
      if (actualToken() == ";") {
        nextToken();
      } else {
        let errorMessage = "Faltando ponto-vírgula";
        handleError(errorMessage);
      }
      receiveStatements();
      return;
    } else {
      return;
    }
  }

  function receiveAssignment() {
    receiveGeneralIdentifier();
    if (actualToken() == "=") {
      nextToken();
      receiveExpression();
      return;
    }
  }

  return {
    receiveStart
  }
}