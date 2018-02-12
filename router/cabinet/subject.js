const { Markup } = require('telegraf')

module.exports = ctx => {
  if (ctx.state.btnVal === 'Отмена')
    return ctx.state.home('Возвращайся скорее!')

  if (ctx.session.cabinet.subjects.includes(ctx.state.btnVal)) {
    ctx.session.cabinet.subject = ctx.state.btnVal
    ctx.session.cabinet.nextCondition = 'upload'
    ctx.reply('Понял-принял. Скидывай свой файл с лекцией', Markup.keyboard(['Отмена'])
      .resize().extra()
    )
  } else {
    ctx.reply('Не нахожу такого предмета :c')
  }
  
  ctx.state.saveSession()
}