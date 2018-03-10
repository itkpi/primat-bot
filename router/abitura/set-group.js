const { Markup } = require('telegraf')

module.exports = ctx => {
  ctx.reply('К кому пойдем?', Markup
    .keyboard(['Отмена'])
    .resize().oneTime().extra()
  )
  ctx.session.abitura.nextCondition = 'changeGroup'
  ctx.state.saveSession()
}
