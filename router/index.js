const Telegraf = require('telegraf'),
      Picasa = require('picasa'),
      { bot, ph } = require('../modules/utils'),

      picasa = new Picasa(),
      
      Router = (name, invalid, route) => new Telegraf.Router(ctx => {
        if (invalid(ctx) || config.routes
                              .filter(route => ctx.session[route] && route !== name)
                              .length !== 0
          ) return Promise.resolve()

        console.log(ctx.session)
        console.log(ctx.message)
        ctx.state.btnVal = ctx.message.text
        return Promise.resolve({ route: route(ctx) })
      })


const registry = require('./registry')(Router),
      schedule = require('./schedule')(Router),
      abstract = require('./abstract')(Router),
      cabinet  = require('./cabinet')(Router),
      upload   = require('./cabinet/upload'),
      photo    = require('./cabinet/photo'),
      timeleft = require('./timeleft')

module.exports = () => {
  bot.on('text', registry, schedule, abstract, cabinet)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)

  bot.hears(config.btns.timeleft, timeleft)
}