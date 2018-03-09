const User = require('../../models/user'),
      parseGroup = require('../../modules/parse-group')

module.exports = route => async ctx => {
  if (ctx.state.btnVal === 'Отмена') {
    ctx.state.home('Лады')
  } else {
    const group = ctx.state.btnVal === 'Домой'
      ? ctx.session.user.group
      : ctx.message.text.trim().toLowerCase()
    const groupData = await parseGroup(group)

    if (!groupData)
      return ctx.reply('Не знаю такой группы, попробуй по-другому')

    if (Array.isArray(groupData)) {
      const answer = groupData.reduce(
        (acc, group) => acc + `${group.group_full_name}\n`,
        'Я не нашел этой группы, но попробуй кое-что похожее:\n'
      )

      return ctx.reply(answer)
    }

    if (!groupData.course) {
      const user = await User.findOne({ group })
      if (user && user.course) {
        groupData.course = user.course
      } else {
        ctx.session = Object.assign({}, ctx.session, groupData)
        ctx.session[route].nextCondition = 'course'
        ctx.state.saveSession()

        return ctx.reply(
          'Оке, но не могу разобрать... Можешь сказать номер курса?',
          { reply_markup: { remove_keyboard: true } }
        )
      }
    }

    ctx.session = Object.assign({}, ctx.session, groupData)
    return ctx.state.home('Все готово')
  }
}
