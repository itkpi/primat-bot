module.exports = (...requiredRoles) => (ctx, next) => {
  const isAllowed = requiredRoles.includes(ctx.session.role)
    || requiredRoles.includes(ctx.session.user.role)
  if (!isAllowed) {
    return false
  }
  return next()
}
