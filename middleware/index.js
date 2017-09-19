const User = require('../models/user')

module.exports = (bot, homeMarkup, session) => {
  const start = require('../router/start')(homeMarkup)
  bot.use(session.middleware())

  bot.use((ctx, next) => {
    ctx.state.sessionKey = `${ctx.from.id}:${ctx.chat.id}`
    ctx.state.saveSession = () => session.saveSession(ctx.state.sessionKey, ctx.session)
    ctx.state.error = e => {
      config.routes.forEach(route => ctx.session[route] = null)
      ctx.state.saveSession()
      ctx.reply('Ой, что-то пошло не так :c', homeMarkup)
      console.error(e)
    }
    next()
  })

  bot.use(async (ctx, next) => {
    if (!ctx.session.user && !ctx.session.registry) {
      try {
        const user = await User.findOne({ tgId: ctx.from.id })
        if (user) {
          ctx.session.user = user
          config.session_fields.forEach(field => ctx.session[field] = user[field])
          ctx.session.semester = 1
          ctx.state.saveSession()
          return ctx.reply('Ой, я был занят обновлением твоей сессии и пропустил команду. ' +
            'Повтори, пожалуйста', homeMarkup)
        } else start(ctx)
      } catch(e) {
        return ctx.state.error(e)
      }
    } else {
      console.log(ctx.session.user)
      config.routes.forEach(route => ctx.session[route] ? (console.log(route), console.log(ctx.session[route])) : null)
      console.log()
      next()
    }
  })
}