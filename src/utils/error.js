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
  ResourceNotFoundError,
  OtherError,
};
