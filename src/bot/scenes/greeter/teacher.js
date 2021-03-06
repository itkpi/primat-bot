const config = require('config')
const Scene = require('telegraf/scenes/base')
const rozklad = require('node-rozklad-api')
const greeterService = require('../../service/greeter')
const ignoreCommand = require('../../utils/ignoreCommand')
const msgFromDataToUserData = require('../../utils/msgFromDataToUserData')
const getRegMsg = require('../../../utils/getRegMsg')

const scene = new Scene(config.scenes.greeter.teacher)

scene.enter(ctx => {
  const { msg, keyboard } = ctx.state
  return ctx.reply(msg, keyboard)
})
scene.hears(ignoreCommand, async ctx => {
  const teacher = await rozklad.teachers(ctx.state.cleanedMsg)
  if (!teacher) {
    let teachers
    try {
      teachers = await rozklad.teachers({ search: { query: ctx.state.cleanedMsg } })
    } catch (e) {
      if (e.statusCode !== 400) {
        throw e
      }
      return ctx.reply('Честно, это не очень похоже на какое-либо имя :)')
    }
    if (!teachers) {
      return ctx.reply('У меня нет ни малейшего представления об этом имени. Попробуйте еще раз')
    }
    const { nextScene, currState } = greeterService.getChooseTeacherScene(teachers)
    ctx.state = currState
    return ctx.scene.enter(nextScene.name, nextScene.state)
  }
  const userData = msgFromDataToUserData(ctx.message.from)
  ctx.state.user = await greeterService.registerByTeacher(teacher, userData, ctx.session)
  return ctx.home(getRegMsg(ctx.session.role))
})

module.exports = scene
