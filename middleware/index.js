const start = require('../commands/start'),
      config = require('../config'),
      User = require('../models/user'),
      { bot } = require('../modules/utils'),
      currSem = require('../modules/curr-sem'),

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

  if (process.env.NODE_ENV === 'development') {
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
          ctx.session.semester = currSem()
          ctx.state.clearRoutes()
          ctx.state.saveSession()
          return ctx.state.home('Ой, засмотрелся. Повтори, пожалуйста')
        } else start(ctx)
      } catch (e) {
        return ctx.state.error(e)
      }
    } else {
      const { username: originUsername } = ctx.from,
            { user } = ctx.session
      if (user && user.username !== originUsername) {
        User.findOneAndUpdate({ tgId: ctx.from.id }, { originUsername })
        user.username = originUsername
        ctx.state.saveSession()
      }
      next()
    }
  })
}
