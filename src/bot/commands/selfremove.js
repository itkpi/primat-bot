const config = require('config')
const User = require('../../db/models/user')

module.exports = async ctx => {
  if (ctx.from.id !== config.adminId) {
    return false
  }
  ctx.session = {}
  await User.deleteOne({ tgId: ctx.from.id })
  return ctx.reply('removed')
}
