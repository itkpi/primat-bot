const logger = require('../../utils/logger')

module.exports = (ctx, next) => {
  const {
    id,
    username,
    first_name: firstName,
    last_name: lastName,
  } = ctx.from
  let user = ''
  if (ctx.session.role) {
    user += `${ctx.state.user.role}`
    if (ctx.session.role !== ctx.state.user.role) {
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
  const currScene = ctx.session.__scenes && ctx.session.__scenes.current
  let msg = currScene ? `[${currScene}] ` : ''
  if (ctx.callbackQuery) {
    msg += `clicked on ${ctx.callbackQuery.message.text} -> ${ctx.callbackQuery.data}`
    logger.info(user, msg)
  }
  if (ctx.message) {
    if (ctx.message.text) {
      msg += `sended ${ctx.message.text}`
      logger.info(user, msg)
    } else if (ctx.message.document) {
      msg += 'sended document'
      logger.info(user, msg, ctx.message.document)
    } else if (ctx.message.photo) {
      msg += 'sended photo'
      logger.info(user, msg, ctx.message.photo[ctx.message.photo.length - 1])
    }
  }
  logger.info(ctx.session)
  if (process.env.NODE_ENV === 'development' && ctx.state.user) {
    logger.info(ctx.state.user.toString())
  }
  return next()
}
