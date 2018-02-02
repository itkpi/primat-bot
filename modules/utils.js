const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      Picasa = require('picasa'),
      util = require('util')

exports.request = util.promisify(require('request'))
exports.bot = new Telegraf(process.env.BOT_TOKEN)
exports.ph = new Telegraph()
exports.picasa = new Picasa()

const RozkladApi = require('./rozklad-api')
exports.r = new RozkladApi()