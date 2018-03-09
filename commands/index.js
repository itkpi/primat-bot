const { bot } = require('../modules/utils'),
      deletesessionCmd = require('./deletesession'),
      showLocationCmd = require('./show-location'),
      hideLocationCmd = require('./hide-location'),
      helpCmd = require('../router/commands'),
      deleteselfCmd = require('./deleteself'),
      updsessionCmd = require('./updsession'),
      telegraphCmd = require('./telegraph'),
      buildingCmd = require('./building'),
      phupdateCmd = require('./phupdate'),
      schedule = require('./schedule'),
      setmeCmd = require('./setme'),
      startCmd = require('./start'),
      phoneCmd = require('./phone'),
      unsubCmd = require('./unsub'),
      subCmd = require('./sub')

module.exports = () => {
  bot.command('start', startCmd)

  bot.use((ctx, next) => ctx.session.user || ctx.session.registry
    ? next()
    : null
  )

  bot.command('/deletesession', deletesessionCmd)
  bot.command('/show_location', showLocationCmd)
  bot.command('/hide_location', hideLocationCmd)
  bot.command('/updsession', updsessionCmd)
  bot.command('/deleteself', deleteselfCmd)
  bot.command('/telegraph', telegraphCmd)
  bot.command('/phupdate', phupdateCmd)
  bot.command('/building', buildingCmd)
  bot.command('/schedule', schedule)
  bot.command('/setme', setmeCmd)
  bot.command('/phone', phoneCmd)
  bot.command('/unsub', unsubCmd)
  bot.command('/help', helpCmd)
  bot.command('/sub', subCmd)

  bot.command('/b', buildingCmd)
  bot.command('/s', schedule)
  bot.command('/h', helpCmd)
}
