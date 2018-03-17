const { bot } = require('../modules/utils'),
      config = require('../config'),

      inlineHandler = require('./inline'),
      registry = require('./registry'),
      schedule = require('./schedule'),
      abstract = require('./abstract'),
      timeleft = require('./timeleft'),
      commands = require('./commands'),
      teachers = require('./teachers'),
      cabinet = require('./cabinet'),
      photo = require('./cabinet/photo'),
      upload = require('./cabinet/upload'),

      abitura = require('./abitura'),

      { callbackBtn } = require('../modules/utils'),

      {
        timeleft: timeleftBtn,
        teachers: teachersBtn,
        commands: commandsBtn
      } = config.home_btns

module.exports = () => {
  bot.on('text', registry, schedule, abstract, cabinet, abitura)

  bot.on('document', upload)
  bot.on('photo', photo)

  bot.on('callback_query', callbackBtn)
  bot.on('inline_query', inlineHandler)

  bot.hears(timeleftBtn, timeleft)
  bot.hears(teachersBtn, teachers)
  bot.hears(commandsBtn, commands)

  bot.catch(e => {
    bot.telegram.sendMessage(config.ownerId, `|Error: ${e.message}`)
    console.error(e)
  })
}
