const parseGroup = require('../../modules/parse-group')

module.exports = route => async ctx => {
  const num = ctx.message.text.trim()

  const response = await parseGroup(ctx.session.tmpGroup)
  const groupData = response.groups[num - 1]

  if (!groupData) {
    return ctx.reply('Какой-то неправильный номер. Порядок начинается с единицы :)')
  }

  ctx.session = Object.assign({}, ctx.session, groupData)

  if (!groupData.course) {
    ctx.session[route].nextCondition = 'course'
    ctx.state.saveSession()

    return ctx.reply(
      'Оке, но не могу разобрать... Можешь сказать номер курса?',
      { reply_markup: { remove_keyboard: true } }
    )
  }

  return ctx.state.home('Все готово')
}
