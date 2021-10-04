class AuthorizeError {
  constructor() {
    this.message = 'unauthorized';
  }
}

class ResourceNotFoundError {
  constructor(message = null) {
    this.message = message;
  }
}

module.exports = {
  AuthorizeError,
  ResourceNotFoundError,
};