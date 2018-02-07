const { Markup } = require('telegraf')

module.exports = ctx => {
  ctx.session.abitura.nextCondition = 'building'
  ctx.state.saveSession()
  ctx.reply('Введи номер корпуса', Markup.keyboard(['Назад']).resize().extra())
}