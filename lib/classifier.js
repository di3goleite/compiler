const regularExpressions = require('./../common/regularExpressions');

// Run classification properly
function checkClassification(regexes, classifications, lexeme) {
  // Classification result
  let result = '';

  // Iterate each of the regexes searching for a match
  regexes.forEach((regex, index) => {
    if (regex.test(lexeme)) {
      // Returns the classification a match is found
      result = classifications[index];
      return;
    }
  });

  return result;
}

// Classify lexemes
function classifyLexeme(lexeme) {
  const regexes = Object.values(regularExpressions.lexical);
  const classifications = Object.keys(regularExpressions.lexical);
  return checkClassification(regexes, classifications, lexeme);
}

// Classify errors
function classifyError(error) {
  const regexes = Object.values(regularExpressions.errors);
  const classifications = Object.keys(regularExpressions.errors);
  return checkClassification(regexes, classifications, error);
}

// Execute classifier
function run(lexems) {
  const result = [];
  let classification = '';

  lexems.forEach(lexeme => {
    classification = classifyLexeme(lexeme['value']);

    // Lexeme classification found
    if (classification.length > 0) {
      result.push({
        line: lexeme['line'],
        value: lexeme['value'],
        type: 'lexeme',
        class: classification
      });
    // No lexeme found, proceeding to error classification
    } else {
      result.push({
        line: lexeme['line'],
        value: lexeme['value'],
        type: 'error',
        class: classifyError(lexeme['value'])
      });
    }
  });

  return result;
}

module.exports = { run };