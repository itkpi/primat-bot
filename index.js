global.config = require('./config')

const express = require('express'),

      { bot } = require('./modules/utils'),
      
      commandHandler = require('./commands'),
      middleware = require('./middleware'),
      router = require('./router'),

      api = require('./api'),

      app = express(),
      port = process.env.PORT || 3210

app.use((req, res, next) => {
  if ([`/bot${process.env.BOT_TOKEN}`, '/'].includes(req.url))
    return next()

  console.log(req.method, req.url)
})

if (process.env.LOCATION === 'local') {
  bot.telegram.deleteWebhook()
    .then(() => bot.startPolling())
    .catch(console.error)
} else {
  bot.telegram.setWebhook(`${process.env.URL}/bot${process.env.BOT_TOKEN}`);
  app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
}

middleware()
commandHandler()
router()

app.use('/api', api)


app.use((req, res, next) => {
  res.status(404).end('404 Error :c')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).end('ooops, error :c')
})

app.listen(port, () => console.log(`Server is running on port ${port}`))