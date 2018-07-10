const User = require('../../db/models/user')
const setSession = require('../utils/setSession')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      await setSession(ctx.from.id, ctx.session)
    }
  }
  return next()
}
