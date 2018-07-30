const logger = require('../utils/logger')

module.exports = (ctx, next) => {
  logger.info(ctx.method, ctx.path)
  return next()
}
