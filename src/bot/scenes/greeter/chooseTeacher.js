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
  const teacherName = ctx.message.text
  const teacher = teachers.find(
    item => [item.teacher_full_name, item.teacher_name].includes(teacherName),
  )
  if (!teacher) {
    return ctx.reply('Кнопочки существуют не просто так')
  }
  const userData = msgFromDataToUserData(ctx.message.from)
  const user = await greeterService.registerByTeacher(teacher, userData)
  return ctx.finishRegistry(user)
})

module.exports = scene
