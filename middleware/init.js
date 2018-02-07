const Telegraf = require('telegraf'),
      { home_btns, abitura_home_btns } = config,
      { bot } = require('../modules/utils')

module.exports = session => (ctx, next) => {
  ctx.state.homeMarkup = Telegraf.Markup
    .keyboard(Object.values(home_btns), { columns: 2 })
    .resize().extra()

  ctx.state.abituraMarkup = Telegraf.Markup.keyboard(Object.values(abitura_home_btns)).resize().extra()

  ctx.state.sessionKey = `${ctx.from.id}:${ctx.chat.id}`

  ctx.state.saveSession = () => session.saveSession(ctx.state.sessionKey, ctx.session)

  ctx.state.clearRoutes = () => {
    config.routes.forEach(route => ctx.session[route] = null)
    ctx.state.saveSession()
  }

  ctx.state.home = msg => {
    ctx.state.clearRoutes()

    if (ctx.session.user.isAbitura && !ctx.session.group) {
      ctx.session.abitura = {}
      ctx.state.saveSession()
      ctx.reply(msg, ctx.state.abituraMarkup)
    } else {
      ctx.reply(msg, ctx.state.homeMarkup)
    }
  }
  ctx.state.homeWithHTML = msg => {
    ctx.state.clearRoutes()
    return ctx.replyWithHTML(msg, ctx.state.homeMarkup)
  }

  ctx.state.error = e => {
    ctx.state.clearRoutes()

    let markup
    if (ctx.session.user) {
      if (ctx.session.group || ctx.session.user.isTeacher)
        markup = ctx.state.homeMarkup
      else if (ctx.session.user.isAbitura) {
        ctx.state.abitura = {}
        markup = ctx.state.abituraMarkup
      }
    }
    ctx.reply('Ой, что-то пошло не так :c', markup)
    console.error(e)
  }

  next()
}