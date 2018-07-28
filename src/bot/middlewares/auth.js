const config = require('config')
const userService = require('../service/user')
const sessionService = require('../service/session')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    const user = await userService.getByTgId(ctx.from.id)
    if (user) {
      await sessionService.setByUser(user, ctx.session)
      ctx.state.triggerSceneMsg = 'Какой-то злой колдун украл твою сессию, '
        + 'но я уже все починил. Попробуй еще раз'
      ctx.state.triggerScene = config.scenes.home.self
    } else {
      ctx.state.triggerScene = config.scenes.greeter.self
    }
  }
  return next()
}
