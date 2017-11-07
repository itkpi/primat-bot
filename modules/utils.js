const Telegraf = require('telegraf'),
      util = require('util'),

      bot = new Telegraf(process.env.BOT_TOKEN)
      request = util.promisify(require('request'))

module.exports = { request, bot }