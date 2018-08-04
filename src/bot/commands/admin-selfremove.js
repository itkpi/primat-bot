const User = require('../../db/models/user')

module.exports = async ctx => {
  ctx.session = {}
  await User.deleteOne({ tgId: ctx.from.id })
  return ctx.reply('session and user removed')
}
