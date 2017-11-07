global.config = require('./config')

const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      RedisSession = require('telegraf-session-redis')
      express = require('express'),

      port = process.env.PORT || 3210,
      redisConfig = {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },

      app = express(),
      ph = new Telegraph(),
      session = new RedisSession({ store: redisConfig }),

      middleware = require('./middleware'),
      commandHandler = require('./commands'),

      { bot } = require('./modules/utils'),
      router = require('./router'),
      api = require('./api')

app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

if (process.env.LOCATION === 'local') {
  bot.telegram.deleteWebhook()
  .then(() => bot.startPolling())
  .catch(console.error)
} else {
  bot.telegram.setWebhook(`${process.env.URL}/bot${process.env.BOT_TOKEN}`);
  app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
}

middleware(session)

commandHandler(ph)

router(ph)


app.use('/api', require('./api'))

// app.get('/*', (req, res) => res.end(`<h1>I'm a telegram bot, not a web application. So, visit me <a href="https://t.me/primat_bot">there</a></h1>`))

app.use((req, res, next) => {
  res.status(404).end('404 Error :c')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).end('ooops, error :c')
})

app.listen(port, () => console.log(`Server is running on port ${port}`))