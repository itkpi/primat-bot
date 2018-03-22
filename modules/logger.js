const bunyan = require('bunyan')
const { name } = require('../package')
const log = bunyan.createLogger({
  name,
  serializers: bunyan.stdSerializers,
  level: process.env.LOG_LEVEL || 'info'
})

module.exports = log
