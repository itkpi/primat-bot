const config = require('config')
const userService = require('../service/user')
const sessionService = require('../service/session')

module.exports = async (ctx, next) => {
  const user = await userService.getByTgId(ctx.from.id)
  if (!user) {
    ctx.state.triggerScene = config.scenes.greeter.self
  } else if (!ctx.session.role) {
    await sessionService.setByUser(user, ctx.session)
    ctx.state.triggerSceneMsg = 'Какой-то злой колдун украл твою сессию, '
      + 'но я уже все починил. Попробуй еще раз'
    ctx.state.triggerScene = config.scenes.home.self
  }
  ctx.state.user = user
  return next()
}
