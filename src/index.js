const config = require('config')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const bodyParser = require('koa-bodyparser')
const telegraf = require('./modules/telegraf')
const serverRouter = require('./route')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')
const loggerMiddleware = require('./middlewares/logger')
const bot = require('./bot')

const app = new Koa()
const koaRouter = new KoaRouter()
const router = serverRouter(koaRouter)

if (app.env !== 'production' && config.db.url.match('production')) {
  process.stderr.write('Error: Launched with production database in non-production environment!')
  process.exit(1)
}

app.use(errorHandler)
app.use(loggerMiddleware)
app.use(bodyParser())
app.use(router)


if (app.env === 'development') {
  telegraf.telegram.deleteWebhook()
    .then(() => telegraf.startPolling())
    .then(() => logger.info('Bot started polling'))
    .catch(e => app.emit('error', e))
} else if (app.env === 'production') {
  const secretPath = `/bot${config.botToken}`
  telegraf.telegram.setWebhook(`${config.appUrl}${secretPath}`)
  logger.info('Bot setted webhook')
  app.use((ctx, next) => {
    if (ctx.url === secretPath) {
      return telegraf.handleUpdate(ctx.request.body, ctx.response)
    }
    return next()
  })
}

bot.start()
  .then(() => app.listen(config.port, () => logger.info(`Server is running on port ${config.port}`)))
  .catch(e => logger.error(e))

app.on('error', e => {
  logger.error(e)
})
