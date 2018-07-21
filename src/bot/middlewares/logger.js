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
  // eslint-disable-next-line no-underscore-dangle
  const currScene = ctx.session.__scenes && ctx.session.__scenes.current
  const {
    id,
    username,
    first_name: firstName,
    last_name: lastName,
  } = ctx.from
  let user = ''
  if (ctx.session.role) {
    user += `${ctx.session.user.role}`
    if (ctx.session.role !== ctx.session.user.role) {
      user += `->${ctx.session.role}`
    }
    user += '|'
  }
  user += id
  if (username) {
    user += ` ${username}`
  }
  if (firstName) {
    user += ` ${firstName}`
  }
  if (lastName) {
    user += ` ${lastName}`
  }
  let msg = currScene ? `[${currScene}] ` : ''
  if (ctx.callbackQuery) {
    msg += `clicked on ${ctx.callbackQuery.message.text} -> ${ctx.callbackQuery.data}`
    logger.info(user, msg)
  }
  if (ctx.message) {
    msg += `sended ${ctx.message.text}`
    logger.info(user, msg)
  }
  logger.info(filterSessionFields(ctx.session))
  return next()
}
