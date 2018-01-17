const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      Stage = require('telegraf/stage'),
      util = require('util'),

      request = util.promisify(require('request')),
      bot = new Telegraf(process.env.BOT_TOKEN),
      ph = new Telegraph(),
      stage = new Stage([], { sessionName: 'sceneSession' })

module.exports = { request, bot, ph, stage }