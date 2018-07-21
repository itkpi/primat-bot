module.exports = (...requiredRoles) => (ctx, next) => {
  const lastArg = requiredRoles[requiredRoles.length - 1]
  let ops = {}
  if (typeof lastArg === 'object') {
    ops = lastArg
    requiredRoles.pop()
  }
  const isAllowed = ops.native
    ? requiredRoles.includes(ctx.session.user.role)
    : requiredRoles.includes(ctx.session.role)
  if (!isAllowed) {
    if (ops.forward) {
      ctx.state.skip = true
      return next()
    }
    return false
  }
  return next()
}
