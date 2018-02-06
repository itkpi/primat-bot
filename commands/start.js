const { Markup } = require('telegraf'),
      User = require('../models/user')


module.exports = async ctx => {
  if (ctx.session.user) {
    ctx.state.clearRoutes()

    const msg = 'Хей, мы ведь уже знакомы'
    console.log(`[start bot-msg] ${ctx.from.username}: ${msg}`)

    return ctx.state.home(msg)
  } else {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      ctx.session.user = user
      ctx.state.saveSession()

      const msg = 'С возвращением!'
      console.log(`[start bot-msg] ${ctx.from.username}: ${msg}`)

      return ctx.reply(msg, ctx.state.homeMarkup)
    } else {
      ctx.session.registry = { nextCondition: 'group' }  
      ctx.state.saveSession()

      const msg = `Привет, <b>${ctx.from.first_name}</b>!\nЯ могу многим с тобой поделиться. ` + 
        `Для нашего хорошего общения мне нужно лучше тебя узнать. ` +
        `Твое имя я уже знаю, но из какой ты группы?\nИспользуй подобный формат: кв-51, kv-51`
      console.log(`[start bot-msg] ${ctx.from.username}: ${msg.split('\n')[0]}`)

      return ctx.replyWithHTML(msg, Markup.keyboard(['Я не студент КПИ', 'Я преподаватель'], { columns: 2 }).resize().extra())
    }    
  }
}