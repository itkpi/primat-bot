const Telegraf = require('telegraf'),
      Picasa = require('picasa'),
      { bot } = require('../modules/utils'),

      picasa = new Picasa(),
      
      Router = (name, invalid, route) => new Telegraf.Router(ctx => {
        if (invalid(ctx) || config.routes
                              .filter(route => ctx.session[route] && route !== name)
                              .length !== 0
          ) return Promise.resolve()

        ctx.state.btnVal = ctx.message.text
        return Promise.resolve({ route: route(ctx) })
      })
      

module.exports = ph => {
  const upload   = require('./upload')(ph, picasa),
        registry = require('./registry')(Router),
        schedule = require('./schedule')(Router),
        cabinet  = require('./cabinet')(Router),
        photo    = require('./photo')(ph, picasa),
        abstract = require('./abstract')(Router),
        timeleft = require('./timeleft')

  bot.on('text', registry, schedule, abstract, cabinet)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)

  bot.hears(config.btns.timeleft, timeleft)
}