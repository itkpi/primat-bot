const User = require('../../db/models/user')
const setSessionFromUser = require('../utils/setSessionFromUser')

module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      await setSessionFromUser(ctx.from.id, ctx.session)
    }
  }
  return next()
}
