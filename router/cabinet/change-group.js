const User = require('../../models/user'),
      parseGroup = require('../../modules/parse-group')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Домой') {
    ctx.state.home('Домой так домой')
  } else {
    const group = ctx.message.text.trim().toLowerCase(),
          groupData = await parseGroup(group)

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
        ctx.session = Object.assign({}, groupData)
        ctx.session.registry = Object.assign({}, userData, groupData, { nextCondition: 'course' })
        ctx.state.saveSession()

        return ctx.reply('Оке, но не могу разобрать... Можешь сказать номер курса?',
              Markup.keyboard([' ']).resize().extra()
          )
      }
    }

    ctx.session = Object.assign({}, ctx.session, groupData)
    return ctx.state.home('Все готово')
  }
}