module.exports = (ctx, next) => {
  if (ctx.state.triggerScene) {
    ctx.state.msg = ctx.state.triggerSceneMsg
    return ctx.scene.enter(ctx.state.triggerScene)
  }
  return next()
}
