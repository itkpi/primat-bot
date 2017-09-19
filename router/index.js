const Telegraf = require('telegraf'),
      Router = (name, invalid, route) => new Telegraf.Router(ctx => {
        if (invalid(ctx) || config.routes
                              .filter(route => ctx.session[route] && route !== name)
                              .length !== 0
          ) return Promise.resolve()

        ctx.state.btnVal = ctx.message.text
        return Promise.resolve({ route: route(ctx) })
      })
      

module.exports = (bot, homeMarkup, request, ph) => {
  const registry = require('./registry')(homeMarkup, request, Router),
        schedule = require('./schedule')(homeMarkup, request, Router),
        cabinet  = require('./cabinet')(homeMarkup, request, Router),
        upload   = require('./upload')(bot, homeMarkup, request, ph),
        abstract = require('./abstract')(homeMarkup, Router),
        start    = require('./start')(bot, homeMarkup),
        photo    = require('./photo')(bot, ph),
        timeleft = require('./timeleft')

  bot.on('text', registry, schedule, abstract, cabinet)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)


  bot.command('/start', start)

  bot.hears(config.btns.timeleft, timeleft)
}