const config = require('config')
const logger = require('../../utils/logger')

function filterSessionFields(session) {
  const { ...result } = session
  const { user } = result
  if (user) {
    config.sessionFilter.forEach(field => delete user[field])
  }
  return result
}

module.exports = (ctx, next) => {
  logger.info(filterSessionFields(ctx.session))
  logger.info(ctx.message)
  return next()
}
