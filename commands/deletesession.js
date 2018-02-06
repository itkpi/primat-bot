module.exports = ctx => {
  ctx.session = null
  ctx.state.saveSession()
  ctx.reply('session has deleted', ctx.state.homeMarkup)
}