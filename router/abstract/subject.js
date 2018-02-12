const Abstract = require('../../models/abstract'),
  { Markup } = require('telegraf')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Отмена')
    return ctx.state.home('nu lan')

  try {
    const amount = await Abstract.count({
      subject: ctx.state.btnVal,
      course: ctx.session.course,
      flow: ctx.session.flow,
      semester: ctx.session.semester
    })

    if (amount) {
      ctx.session.abstract.nextCondition = 'num'
      ctx.session.abstract.subject = ctx.state.btnVal
      ctx.state.saveSession()

      const buttons = new Array(amount)
      for (let i = 0; i < buttons.length; i++) buttons[i] = String(i + 1)
      if (amount > 1) buttons.push('Все')

      ctx.reply(
        'Выбирай номер',
        Markup.keyboard(buttons.concat('Отмена'), { columns: 4 })
          .resize().extra()
      )
    } else {
      ctx.reply('По этому предмету ничего нет :c')
    }
  } catch (e) {
    return ctx.state.error(e)
  }
}