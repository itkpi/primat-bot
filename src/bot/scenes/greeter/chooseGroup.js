const config = require('config')
const Scene = require('telegraf/scenes/base')
const handleGroupRegistry = require('../../handlers/groupRegistry')
const handleGroupChange = require('../../handlers/groupChange')
const handleUpgradeStudent = require('../../handlers/upgradeStudent')
const ignoreCommand = require('../../utils/ignoreCommand')

const { scenes } = config
const scene = new Scene(scenes.greeter.chooseGroup)

scene.enter(ctx => {
  const { msg, keyboard } = ctx.state
  return ctx.reply(msg, keyboard)
})

scene.hears(ignoreCommand, async ctx => {
  const { allowCancel, groups, parent: parentScene } = ctx.scene.state
  if (allowCancel && ctx.message.text === config.btns.cancel) {
    ctx.state.msg = 'Ладненько'
    return ctx.scene.enter(config.scenes.home.self)
  }
  const num = parseInt(ctx.state.cleanedMsg, 10)
  if (!num) {
    return ctx.reply('Выбери какой-то номер')
  }
  const group = groups[num - 1]
  if (!group) {
    return ctx.reply('У тебя есть списочек из номеров')
  }
  ctx.state.group = group
  if (parentScene === config.scenes.home.cabinet.changeGroup) {
    return handleGroupChange(ctx)
  }
  if (parentScene === config.scenes.home.studentUpgrade.self) {
    return handleUpgradeStudent(ctx)
  }
  return handleGroupRegistry(ctx)
})

module.exports = scene
