const User = require('../models/user'),
      config = require('../config')

module.exports = async ctx => {
  if (config.ownerId == ctx.from.id) {
    try {
      await User.remove({ tgId: ctx.from.id })
      const { username, tgId } = ctx.session.user
      console.log(`${username || tgId} has removed his document from the db`)
      ctx.reply('Your document in the db has removed')
    } catch (e) {
      ctx.state.error(e)
    }
  }
}
