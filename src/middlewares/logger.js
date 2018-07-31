const logger = require('../utils/logger')

module.exports = (ctx, next) => {
  if (ctx.path.includes('api') || ctx.path.includes('auth')) {
    logger.info(ctx.method, ctx.path)
  }
  return next()
}
