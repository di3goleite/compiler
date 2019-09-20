const errors = [];

function insert(message) {
  errors.push(message);
}

function get() {
  return errors;
}

module.exports = { insert, get };