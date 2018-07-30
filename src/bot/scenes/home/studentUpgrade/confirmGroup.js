const config = require('config')
const Scene = require('telegraf/scenes/base')
const userService = require('../../../service/user')
const sessionService = require('../../../service/session')

const { self: studentUpgrade, confirmGroup: sceneName } = config.scenes.home.studentUpgrade
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const { text, keyboard } = ctx.state.nextMsg
  return ctx.reply(text, keyboard)
})

scene.hears(config.btns.yes, async ctx => {
  ctx.scene.state.groupData.course = 1
  const user = await userService.upgradeAbiturientToStudent(ctx.from.id, ctx.scene.state.groupData)
  ctx.state.user = user
  await sessionService.setByUser(user, ctx.session)
  return ctx.home('Поздравляю, больше ты не абитуриент!')
})

scene.hears(config.btns.no, ctx => {
  ctx.state.nextMsg = 'Попробуем еще раз'
  return ctx.scene.enter(studentUpgrade)
})

module.exports = scene
