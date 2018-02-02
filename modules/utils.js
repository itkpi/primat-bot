const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      Picasa = require('picasa'),
      util = require('util'),

      request = util.promisify(require('request')),
      bot = new Telegraf(process.env.BOT_TOKEN),
      ph = new Telegraph(),
      picasa = new Picasa()
bot.webhookReply = false
module.exports = { request, bot, ph, picasa }