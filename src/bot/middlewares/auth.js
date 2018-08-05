const config = require('config')
const userService = require('../service/user')
const sessionService = require('../service/session')

module.exports = async (ctx, next) => {
  if (!config.whiteList.includes(ctx.from.id)) {
    return ctx.reply('Ждем начала семестра <3')
  }
  if (ctx.state.chat) {
    return Object.assign(ctx.session, { isChat: true, tgId: ctx.state.chat.tgId })
  }
  if (ctx.session.isChat) {
    ctx.state.chat = await userService.getChat(ctx.session.tgId)
    return next()
  }
  const user = await userService.get(ctx.from.id)
  if (!user) {
    ctx.state.triggerScene = config.scenes.greeter.self
    return next()
  }
  if (!ctx.session.role) {
    await sessionService.setByUser(user, ctx.session)
    ctx.state.triggerSceneMsg = 'Какой-то злой колдун украл твою сессию, '
      + 'но я уже все починил. Попробуй еще раз'
    ctx.state.triggerScene = config.scenes.home.self
  }
  ctx.state.user = user
  const upgradeRoles = [config.roles.bachelor, config.roles.master]
  if (!user.upgradedGraduate && upgradeRoles.includes(user.role)) {
    ctx.session.role = user.role
    ctx.state.triggerScene = config.scenes.upgradeGraduate
  }
  return next()
}
