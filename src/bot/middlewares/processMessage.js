module.exports = (ctx, next) => {
  if (ctx.message.text) {
    ctx.state.cleanedMsg = ctx.message.text.trim().toLowerCase()
  }
  return next()
}
