const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
// const ignoreCommand = require('../../../utils/ignoreCommand')
// const handleGroupChange = require('../../../handlers/groupChange')

const sceneName = config.scenes.home.cabinet.settings
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const buttons = []
  Object.entires(ctx.session.settings).forEach(([setting, value]) => {
    buttons.push(value ? config.btns.settings.off[setting] : config.btns.settings.on[setting])
  })
  // const buttons = Object.values(config.btns)
  return ctx.reply('Оп, настроечки', Markup.keyboard(buttons).resize().extra())
})

// scene.enter(ctx => ctx.reply('К кому пойдем в гости? Назови группу',
//   Markup.keyboard([config.btns.cancel]).resize().extra()))

// scene.hears(ignoreCommand, handleGroupChange)

module.exports = scene
