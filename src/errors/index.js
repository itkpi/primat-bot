const RequestError = require('./RequestError')

module.exports = {
  badRequest(msg) {
    const error = new RequestError(msg)
    error.status = 400
    throw error
  },
  logonFailed(msg) {
    const error = new RequestError(msg)
    error.status = 403
    throw error
  },
  notFound(msg) {
    const error = new RequestError(msg)
    error.status = 404
    throw error
  },
}
