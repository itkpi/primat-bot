const Telegraf = require('telegraf'),
      { cabinet, schedule, abstracts, timeleft } = config.btns,
      { bot } = require('modules/utils')

module.exports = session => (ctx, next) => {
  ctx.state.homeMarkup = Telegraf.Markup
    .keyboard([abstracts, schedule, cabinet, timeleft], { columns: 2 })
    .resize().extra()

  ctx.state.sessionKey = `${ctx.from.id}:${ctx.chat.id}`

  ctx.state.saveSession = () => session.saveSession(ctx.state.sessionKey, ctx.session)

  ctx.state.clearRoutes = () => {
    config.routes.forEach(route => ctx.session[route] = null)
    ctx.state.saveSession()
  }

  ctx.state.home = msg => {
    ctx.state.clearRoutes()
    ctx.reply(msg, ctx.state.homeMarkup)
  }
  ctx.state.homeWithHTML = msg => {
    console.log(msg)
    bot.telegram.deleteWebhook()
      .then(() => bot.startPolling())
      .then(() => {
        ctx.replyWithHTML(msg, ctx.state.homeMarkup)
        ctx.state.clearRoutes() 
      })
      .catch(console.error)
    // ctx.replyWithHTML(msg, ctx.state.homeMarkup)
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch(console.error)
    // ctx.state.clearRoutes()
  }

  ctx.state.error = e => {
    ctx.state.clearRoutes()
    ctx.reply('Ой, что-то пошло не так :c', ctx.session.user ? ctx.state.homeMarkup : null)
    console.error(e)
  }

  next()
}