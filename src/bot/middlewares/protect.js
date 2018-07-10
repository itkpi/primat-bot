module.exports = requiredRole => (ctx, next) => {
  if (ctx.session.role !== requiredRole) {
    return false
  }
  return next()
}
