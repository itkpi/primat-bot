const config = require('config')

module.exports = async ctx => {
  if (ctx.from.id !== config.adminId) {
    return false
  }
  ctx.session = {}
  return ctx.reply('session removed')
}
