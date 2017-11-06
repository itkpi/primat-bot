const Telegraf = require('telegraf'),
      Picasa = require('picasa'),
      picasa = new Picasa(),
      Router = (name, invalid, route) => new Telegraf.Router(ctx => {
        if (invalid(ctx) || config.routes
                              .filter(route => ctx.session[route] && route !== name)
                              .length !== 0
          ) return Promise.resolve()

        ctx.state.btnVal = ctx.message.text
        return Promise.resolve({ route: route(ctx) })
      })
      

module.exports = (bot, homeMarkup, request, ph) => {
  const upload   = require('./upload')(bot, homeMarkup, request, ph, picasa),
        registry = require('./registry')(homeMarkup, request, Router, bot),
        schedule = require('./schedule')(homeMarkup, request, Router),
        cabinet  = require('./cabinet')(homeMarkup, request, Router),
        photo    = require('./photo')(bot, ph, request, picasa),
        abstract = require('./abstract')(homeMarkup, Router),
        timeleft = require('./timeleft')

  bot.on('text', registry, schedule, abstract, cabinet)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)

  bot.hears(config.btns.timeleft, timeleft)
}