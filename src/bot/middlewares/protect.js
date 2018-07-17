module.exports = (...requiredRoles) => (ctx, next) => {
  const lastArg = requiredRoles[requiredRoles.length - 1]
  let forward
  if (typeof lastArg === 'boolean') {
    forward = lastArg
    requiredRoles.pop()
  }
  const isAllowed = requiredRoles.includes(ctx.session.role)
    || requiredRoles.includes(ctx.session.user.role)
  if (!isAllowed) {
    if (forward) {
      ctx.state.skip = true
      return next()
    }
    return false
  }
  return next()
}
