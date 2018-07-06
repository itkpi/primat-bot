const config = require('config')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const bodyParser = require('koa-bodyparser')
const serverRouter = require('./route')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')
const telegraf = require('./modules/telegraf')
const bot = require('./bot')

const app = new Koa()
const koaRouter = new KoaRouter()
const router = serverRouter(koaRouter)

if (app.env !== 'production' && config.db.url.match('prod')) {
  process.stderr.write('Error: Launched with production database in non-production environment!')
  process.exit(1)
}

app.use(errorHandler)
app.use(bodyParser())
app.use(router)

if (app.env === 'development') {
  telegraf.telegram.deleteWebhook()
    .then(() => telegraf.startPolling())
    .catch(e => app.emit('error', e))
} else if (app.env === 'production') {
  const secretPath = `/bot${config.botToken}`
  telegraf.telegram.setWebhook(`${config.appUrl}${secretPath}`)
  app.use((ctx, next) => {
    if (ctx.url === secretPath) {
      return bot.handleUpdate(ctx.request.body, ctx.response)
    }
    return next()
  })
} else if (!app.env) {
  process.stderr.write('Error: NODE_ENV doesn\'t specified!')
  process.exit(1)
}

bot.start()
  .then(() => app.listen(config.port, () => logger.info(`Server is running on port ${config.port}`)))
  .catch(e => logger.error(e))

app.on('error', e => {
  logger.error(e)
})
