const parseGroup = require('../../modules/parse-group'),
      { r } = require('../../modules/utils'),
      User = require('../../models/user'),

      { Markup } = require('telegraf')


module.exports = async ctx => {
    try {
      const group = ctx.message.text.trim().toLowerCase()
      const userData = { tgId: ctx.from.id, username: ctx.from.username }

      if (group === 'я не студент кпи') {
        const user = new User(userData)
        user.save()
        ctx.session.user = user

        return ctx.state.home(
          'Давно, конечно, я такой грустной новости не слышал. Но ничего, мы тут всех любим!'
        )
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


      if (!groupData.course) {
        const user = await User.findOne({ group, course: { $exists: true } })
        if (user) {
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

      const user = new User(Object.assign({}, userData, groupData))
      user.save()
      ctx.session.user = user
      ctx.state.saveSession()
      
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