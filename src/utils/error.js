class AuthorizeError {
  constructor(message = 'unauthorized') {
    this.message = message;
  }
}

class ResourceNotFoundError {
  constructor(message = null) {
    this.message = message;
  }
}

class OtherError {
  constructor(message = null) {
    this.message = message;
  }
}

module.exports = {
  AuthorizeError,
  ResourceNotFoundError,
  OtherError,
};
