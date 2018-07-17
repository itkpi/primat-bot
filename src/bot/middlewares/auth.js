const config = require('config')
const userService = require('../service/user')
const sessionService = require('../service/session')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    const user = await userService.getByTgId(ctx.from.id)
    if (user) {
      await sessionService.setByUser(user, ctx.session)
    } else {
      ctx.state.scene = config.scenes.greeter.self
    }
  }
  return next()
}
