const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      util = require('util'),

      request = util.promisify(require('request')),
      bot = new Telegraf(process.env.BOT_TOKEN),
      ph = new Telegraph()

module.exports = { request, bot, ph }