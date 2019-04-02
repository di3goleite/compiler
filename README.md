# Feito em Node JS por **Diego Leite** para a disciplina EXA869 - MI - Processadores de Linguagem de Programação.

## Instruções
1. Faça o download da versão mais recente do [Node JS](https://nodejs.org/en/download/)
2. Abra o terminal e navegue até a pasta do projeto
3. Execute o software através do comando: `node index.js`

## Parte 1 - Análise Léxica
Input:
```
/* This is
   a block
   comment
*/
metodo(hue) {
  inteiro br = -      2.0;
  real test=1 - 2;

  escreva("hellooooooooooooo");
  escreva("world!!!hue");

  // This is a line comment
  se (hue != 1 && br >= 3 || test == 1) {
    resultado hue;
  } senao {
    resultado br;
  }
}
```

Output:
```
05  PRE metodo
05  DEL (
05  IDE hue
05  DEL )
05  DEL {
06  PRE inteiro
06  IDE br
06  REL =
06  NRO -      2.0
06  DEL ;
07  PRE real
07  IDE test
07  REL =
07  NRO 1
07  ART -
07  NRO  2
07  DEL ;
09  PRE escreva
09  DEL (
09  CdC "hellooooooooooooo"
09  DEL )
09  DEL ;
10  PRE escreva
10  DEL (
10  CdC "world!!!hue"
10  DEL )
10  DEL ;
13  PRE se
13  DEL (
13  IDE hue
13  REL !=
13  NRO 1
13  LOG &&
13  IDE br
13  REL >=
13  NRO 3
13  LOG ||
13  IDE test
13  REL ==
13  NRO 1
13  DEL )
13  DEL {
14  PRE resultado
14  IDE hue
14  DEL ;
15  DEL }
15  PRE se
15  IDE nao
15  DEL {
16  PRE resultado
16  IDE br
16  DEL ;
17  DEL }

Arquivo analisado com sucesso. Nenhum erro foi encontrado.
```

## Glossário

Tabela de Lexemas:

| Sigla | Significado          |
|-------|----------------------|
| PRE   | RESERVED_WORD        |
| IDE   | IDENTIFIER           |
| NRO   | NUMBER               |
| DEL   | DELIMITER            |
| ART   | ARITHMETIC_OPERATION |
| REL   | RELATIONAL_OPERATION |
| LOG   | LOGIC_OPERATION      |
| CdC   | CHARACTER_SEQUENCE   |

Tabela de Erros:

| Sigla | Significado          |
|-------|----------------------|
| NUL   | UNDEFINED_LEXEME     |
| NMF   | MALFORMED_NUMBER     |
| CMF   | MALFORMED_SEQUENCE   |
| CoMF  | MALFORMED_COMMENT    |
| IMF   | MALFORMED_IDENTIFIER |
