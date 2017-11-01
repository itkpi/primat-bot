global.config = require('./config')

const Telegraf = require('telegraf'),
      Telegraph = require('telegraph-node'),
      RedisSession = require('telegraf-session-redis')
      express = require('express'),
      util = require('util'),
      request = util.promisify(require('request')),

      botToken = process.env.BOT_TOKEN,
      port = process.env.PORT || 3210,
      redisConfig = {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },

      app = express(),
      ph = new Telegraph(),
      bot = new Telegraf(botToken),
      session = new RedisSession({ store: redisConfig }),

      { cabinet, schedule, abstracts, timeleft } = config.btns,
      homeMarkup = Telegraf.Markup.keyboard([abstracts, schedule, cabinet, timeleft],
                    { columns: 2 }).resize().extra(),

      middleware = require('./middleware'),
      commandHandler = require('./commands'),
      router = require('./router'),
      api = require('./api')

app.use((req, res, next) => {
  console.log(req.url)
  next()
})

if (process.env.LOCATION === 'local') {
  bot.startPolling()
} else {
  bot.telegram.setWebhook(`${process.env.URL}/bot${botToken}`);
  app.use(bot.webhookCallback(`/bot${botToken}`));
}

middleware(bot, homeMarkup, session)

commandHandler(bot, ph, request, homeMarkup)

router(bot, homeMarkup, request, ph)


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