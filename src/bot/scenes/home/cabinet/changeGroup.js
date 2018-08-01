const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../../utils/ignoreCommand')
const handleGroupChange = require('../../../handlers/groupChange')
const sessionService = require('../../../service/session')

const sceneName = config.scenes.home.cabinet.changeGroup
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const buttons = [config.btns.cancel]
  if (ctx.session.group !== ctx.state.user.group) {
    buttons.unshift(config.btns.domoi)
  }
  const keyboard = Markup.keyboard(buttons, { columns: 2 }).resize().extra()
  ctx.reply('К кому пойдем в гости? Назови группу', keyboard)
})

scene.hears(config.btns.domoi, ctx => {
  sessionService.setByGroup(ctx.state.user, ctx.session)
  return ctx.home('В родные места')
})

scene.hears(ignoreCommand, handleGroupChange)

module.exports = scene
