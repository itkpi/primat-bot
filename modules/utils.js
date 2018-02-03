const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      Picasa = require('picasa'),
      util = require('util')

exports.request = util.promisify(require('request'))
exports.bot = new Telegraf(process.env.BOT_TOKEN, { webhookReply: false })
exports.ph = new Telegraph()
exports.picasa = new Picasa()
exports.Router = (name, invalid, route) => new Telegraf.Router(ctx => {
    if (invalid(ctx) || config.routes
                        .filter(route => ctx.session[route] && route !== name)
                        .length !== 0
      ) return Promise.resolve()

    ctx.state.btnVal = ctx.message.text
    return Promise.resolve({ route: route(ctx) })
  })

const RozkladApi = require('./rozklad-api')
exports.r = new RozkladApi()