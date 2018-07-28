const RequestError = require('./RequestError')

module.exports = {
  badRequest(message) {
    const error = new RequestError(message)
    error.status = 400
    throw error
  },
}
