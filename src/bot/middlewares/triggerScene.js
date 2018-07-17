module.exports = (ctx, next) => {
  if (ctx.state.scene) {
    return ctx.scene.enter(ctx.state.scene)
  }
  return next()
}
