const User = require('../../db/models/user')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      ctx.session.user = user
    }
  }
  return next()
}
