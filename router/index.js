const { bot } = require('../modules/utils'),

      registry = require('./registry'),
      schedule = require('./schedule'),
      abstract = require('./abstract'),
      timeleft = require('./timeleft'),
      commands = require('./commands'),
      teachers = require('./teachers'),
      cabinet  = require('./cabinet'),
      photo    = require('./cabinet/photo'),
      upload   = require('./cabinet/upload'),

      abitura = require('./abitura'),

      { callbackBtn } = require('../modules/utils'),

      {
        timeleft: timeleftBtn,
        teachers: teachersBtn,
        commands: commandsBtn
      } = config.home_btns

module.exports = () => {
  bot.on('text', registry, schedule, abstract, cabinet, abitura)

  // part of cabinet router
  bot.on('document', upload)
  bot.on('photo', photo)

  bot.on('callback_query', callbackBtn)

  bot.hears(timeleftBtn, timeleft)
  bot.hears(teachersBtn, teachers)
  bot.hears(commandsBtn, commands)
}
