const parseGroup = require('../../modules/parse-group')
const User = require('../../models/user')

module.exports = async ctx => {
  const num = ctx.message.text.trim()

  const response = await parseGroup(ctx.session.tmpGroup)
  const groupData = response.groups[num - 1]

  if (!groupData) {
    return ctx.reply('Какой-то неправильный номер. Порядок начинается с единицы :)')
  }

  ctx.session = Object.assign({}, ctx.session, groupData)
  ctx.session.registry = Object.assign({}, ctx.session.registry, groupData)

  if (!groupData.course) {
    ctx.session.registry.nextCondition = 'course'
    ctx.state.saveSession()

    return ctx.reply(
      'Оке, но не могу разобрать... Можешь сказать номер курса?',
      { reply_markup: { remove_keyboard: true } }
    )
  }


  const user = new User(Object.assign({}, ctx.session.registry, { nextCondition: undefined, isStudent: true }))
  user.save()
  ctx.session.user = user

  return ctx.state.home('Все готово')
}
