/* eslint-disable global-require */

module.exports = {
  logger: require('./logger'),
  auth: require('./auth'),
  Session: require('./session'),
  scenes: require('../scenes'),
  errorHandler: require('./errorHandler'),
  processMessage: require('./processMessage'),
}
