const User = require('../../models/user'),
      parseGroup = require('../../modules/parse-group')

module.exports = route => async ctx => {
  if (ctx.state.btnVal === 'Отмена') {
    ctx.state.home('Лады')
  } else {
    const group = ctx.state.btnVal === 'Домой'
      ? ctx.session.user.rGroupId
      : ctx.message.text.trim().toLowerCase()

    const groupData = await parseGroup(group)

    if (groupData === null)
      return ctx.reply('Не знаю такой группы, попробуй по-другому')

    if (groupData.type === 'choice') {
      const answer = groupData.groups.reduce(
        (acc, group, indx) => acc + `<b>${indx + 1}</b>. ${group.group}. ` +
          `Идентификатор: ${group.rGroupId}\n`,
        'Отправь порядковый номер одной из возможных групп:\n'
      )

      ctx.session.tmpGroup = group
      ctx.session[route].nextCondition = 'choice'
      ctx.state.saveSession()
      return ctx.replyWithHTML(answer, { reply_markup: { remove_keyboard: true } })
    }

    if (Array.isArray(groupData)) {
      const answer = groupData.reduce(
        (acc, group) => acc + `${group.group_full_name}\n`,
        'Я не нашел этой группы, но попробуй кое-что похожее:\n'
      )

      return ctx.reply(answer)
    }

    if (!groupData.course) {
      if (ctx.state.btnVal === 'Домой') {
        groupData.course = ctx.session.user.course
      } else {
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
    }

    ctx.session = Object.assign({}, ctx.session, groupData)
    return ctx.state.home('Все готово')
  }
}
