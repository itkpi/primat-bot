class RequestError extends Error {
  constructor(message) {
    super()
    this.message = message
    this.timestamp = new Date().toISOString()
  }
}

module.exports = RequestError
