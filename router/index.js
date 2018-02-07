const { bot } = require('../modules/utils'),

      registry = require('./registry'),
      schedule = require('./schedule'),
      abstract = require('./abstract'),
      timeleft = require('./timeleft'),
      cabinet  = require('./cabinet'),
      photo    = require('./cabinet/photo'),
      upload   = require('./cabinet/upload'),

      abitura = require('./abitura'),

      { callbackBtn } = require('../modules/utils')

module.exports = () => {
  bot.on('text', registry, schedule, abstract, cabinet, abitura)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)

  bot.on('callback_query', callbackBtn)

  bot.hears(config.home_btns.timeleft, timeleft)
}
