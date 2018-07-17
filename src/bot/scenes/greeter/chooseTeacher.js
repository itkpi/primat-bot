const config = require('config')
const Scene = require('telegraf/scenes/base')
const greeterService = require('../../service/greeter')
const ignoreCommand = require('../../utils/ignoreCommand')
const msgFromDataToUserData = require('../../utils/msgFromDataToUserData')

const { scenes } = config
const scene = new Scene(scenes.greeter.chooseTeacher)

scene.enter(ctx => {
  const { msg, keyboard } = ctx.state
  return ctx.reply(msg, keyboard)
})

scene.hears(ignoreCommand, async ctx => {
  const { teachers } = ctx.scene.state
  const num = parseInt(ctx.state.cleanedMsg, 10)
  if (!num) {
    return ctx.reply('Выбери какой-то номер')
  }
  const teacher = teachers[num - 1]
  if (!teacher) {
    return ctx.reply('У тебя есть списочек из номеров')
  }
  const userData = msgFromDataToUserData(ctx.message.from)
  const user = await greeterService.registerByTeacher(teacher, userData)
  return ctx.finishRegistry(user)
})

module.exports = scene
