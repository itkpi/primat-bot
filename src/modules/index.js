const telegraf = require('./telegraf')

module.exports.telegraf = telegraf

const univerService = require('../bot/service/univer')
const userService = require('../bot/service/user')

telegraf.extendContext(userService, univerService)
