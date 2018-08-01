module.exports = async ctx => {
  ctx.session = {}
  return ctx.reply('session removed')
}
