const config = require('config')
const pino = require('pino')(config.logger)

module.exports = pino
