module.exports = (...requiredRoles) => (ctx, next) => {
  const requiredRolesCopy = requiredRoles.slice()
  const lastArg = requiredRolesCopy[requiredRolesCopy.length - 1]
  let ops = {}
  if (typeof lastArg === 'object') {
    ops = lastArg
    requiredRolesCopy.pop()
  }
  const isAllowed = ops.native
    ? requiredRolesCopy.includes(ctx.state.user.role)
    : requiredRolesCopy.includes(ctx.session.role)
  if (!isAllowed) {
    if (ops.forward) {
      ctx.state.skip = true
      return next()
    }
    return false
  }
  return next()
}
