const start = require('../router/start'),
      User = require('../models/user'),
      { bot } = require('../modules/utils'),

      logger = require('./logger'),
      init = require('./init'),
      
      RedisSession = require('telegraf-session-redis'),

      redisConfig = {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },

      session = new RedisSession({ store: redisConfig })

module.exports = () => {
  if (process.env.STATUS === 'dev') {
    bot.use((ctx, next) => config.ownerId == ctx.from.id
      ? next()
      : ctx.reply('Соре, я пока кушаю бананы. Но скоро вернусь!')
    )
  }

  bot.use(session.middleware())

  bot.use(logger)

  bot.use(init(session))

  bot.use(async (ctx, next) => {
    if (!ctx.session.user && !ctx.session.registry) {
      try {
        const user = await User.findOne({ tgId: ctx.from.id })
        if (user) {
          ctx.session.user = user
          config.session_fields.forEach(field => ctx.session[field] = user[field])
          ctx.session.semester = 1
          ctx.state.clearRoutes()
          ctx.state.saveSession()
          return ctx.reply('Ой, я был занят обновлением твоей сессии и пропустил команду. ' +
            'Повтори, пожалуйста', ctx.state.homeMarkup)
        } else start(ctx)
      } catch(e) {
        return ctx.state.error(e)
      }
    } else {
      next()
    }
  })
}