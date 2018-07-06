const config = require('config')
const Scene = require('telegraf/scenes/base')
const handleGroupRegistry = require('../../handlers/groupRegistry')
const ignoreCommand = require('../../utils/ignoreCommand')

const { scenes } = config
const scene = new Scene(scenes.greeter.chooseGroup)

scene.enter(ctx => {
  const { msg, keyboard } = ctx.scene.state
  return ctx.reply(msg, keyboard)
})

scene.hears(ignoreCommand, ctx => {
  const num = parseInt(ctx.message.text.trim().toLowerCase(), 10)
  if (!num) {
    return ctx.reply('Выбери какой-то номер')
  }
  const group = ctx.scene.state.groups[num - 1]
  if (!group) {
    return ctx.reply('У тебя есть списочек из номеров')
  }
  ctx.scene.state.group = group
  return handleGroupRegistry(ctx)
})

module.exports = scene
