const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/greeter')
const handleGroupRegistry = require('../../handlers/groupRegistry')
const msgFromDataToUserData = require('../../utils/msgFromDataToUserData')
const ignoreCommand = require('../../utils/ignoreCommand')

const scene = new Scene(config.scenes.greeter.self)
const btns = config.btns.greeter
const { roles } = config

scene.enter(ctx => {
  const { msg, keyboard } = service.welcome(ctx.from.first_name)
  return ctx.replyWithHTML(msg, keyboard)
})
scene.hears(btns.abiturient, async ctx => {
  const user = await service.register(msgFromDataToUserData(ctx.message.from), roles.abiturient)
  return ctx.finishRegistry(user)
})
scene.hears(btns.noKPI, async ctx => {
  const user = await service.register(msgFromDataToUserData(ctx.message.from), roles.noKPI)
  return ctx.finishRegistry(user)
})
scene.hears(btns.teacher, ctx => {
  ctx.reply(btns.teacher)
})
scene.hears(ignoreCommand, handleGroupRegistry)

module.exports = scene
