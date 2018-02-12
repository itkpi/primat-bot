const parseGroup = require('../../modules/parse-group'),
  User = require('../../models/user'),

  { Markup } = require('telegraf')


module.exports = async ctx => {
  try {
    const group = ctx.message.text.trim().toLowerCase()
    const userData = { tgId: ctx.from.id, username: ctx.from.username }

    if (group === 'я не студент кпи') {
      const user = new User(Object.assign(userData, { notKPI: true }))
      user.save()
      ctx.session.user = user

      return ctx.state.home(
        'Давно, конечно, я такой грустной новости не слышал. Но ничего, мы тут всех любим!'
      )
    }

    if (group === 'я преподаватель') {
      ctx.session.registry = Object.assign({}, userData, { nextCondition: 'teacher' })
      ctx.state.saveSession()
      return ctx.reply(
        'Введите полностью ваше ФИО',
        Markup.keyboard(['Назад']).resize().extra()
      )
    }

    if (group === 'я абитуриент') {
      const user = new User(Object.assign({}, userData, { isAbitura: true }))
      user.save()
      ctx.session.user = user

      return ctx.state.home('Ты обязательно поступишь!')
    }

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

    ctx.session = groupData

    if (!groupData.course) {
      const user = await User.findOne({ group, course: { $exists: true } })
      if (user) {
        groupData.course = user.course
      } else {
        ctx.session.registry = Object.assign({}, userData, groupData, { nextCondition: 'course' })
        ctx.state.saveSession()

        return ctx.reply(
          'Оке, но не могу разобрать... Можешь сказать номер курса?',
          { reply_markup: { remove_keyboard: true } }
        )
      }
    }

    const user = new User(Object.assign({}, userData, groupData, { isStudent: true }))
    user.save()
    ctx.session.user = user
      
    const phrases = [
      'О, ты всего первый год, многого еще не знаешь',
      'Отлично, ты на втором курсе, а тебя еще не отчислили. Молодец!',
      'На третьем курсе хочется умереть все больше, да?',
      'Диплом уже готов?'
    ]
    return ctx.state.home(phrases[user.course - 1])
  } catch(e) {
    ctx.state.error(e)
  }
}