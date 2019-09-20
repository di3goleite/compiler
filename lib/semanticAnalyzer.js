let errors = [];

function bootstrap() {
  errors = [];
}

function insert(message) {
  errors.push(message);
}

function get() {
  return errors;
}

module.exports = { insert, get, bootstrap };