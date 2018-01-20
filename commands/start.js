const { Markup } = require('telegraf'),
      User = require('../models/user')


module.exports = async ctx => {
  if (ctx.session.user) {
    ctx.state.clearRoutes()
    return ctx.reply('Хей, мы ведь уже знакомы', ctx.state.homeMarkup)
  } else {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      ctx.session.user = user
      ctx.state.saveSession()
      ctx.reply('С возвращением!', ctx.state.homeMarkup)
    } else {
      ctx.session.registry = { nextCondition: 'group' }  
      ctx.state.saveSession()
      return ctx.replyWithHTML(`Привет, <b>${ctx.from.first_name}</b>!\nЯ бот-примат. ` + 
        `Для нашего хорошего общения мне нужно лучше тебя узнать. ` +
        `Твое имя я уже знаю, но из какой ты группы (напиши ее на украинском)?`, Markup
          .keyboard(['Я не студент КПИ']).resize().extra()
      )
    }    
  }
}