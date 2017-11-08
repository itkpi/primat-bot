const validGroup = require('../modules/valid-group'),
      { bot, request } = require('../modules/utils'),
      User = require('../models/user'),

      { Markup } = require('telegraf')

module.exports = Router => {
  const router = Router('registry', ctx => !ctx.session.registry, ctx => ctx.session.registry.nextCondition)

  router.on('group', async ctx => {
    try {
      const group = ctx.message.text.trim().toLowerCase(),
        groupInfo = await validGroup(group),
        userObj = Object.assign({
          tgId: ctx.from.id,
          username: ctx.from.username
        }, groupInfo.values)

      if (!'who' in groupInfo) return ctx.reply('Мне такая группа не знакома. Попробуй еще или жми кнопку')

      if (!userObj.course && !userObj.flow && groupInfo.who !== 'notstudent') {
          ctx.session = groupInfo.values
          ctx.session.registry = Object.assign({}, userObj, { nextCondition: 'flow' })
          ctx.state.saveSession()
          return ctx.reply('Оке, но не могу разобрать... Можешь назвать свой поток? (КВ, к примеру)', Markup.keyboard([' ']).resize().extra())
      }

      const user = new User(userObj)
      user.save()

      Object.assign(ctx.session, groupInfo.values)
      ctx.session.user = user

      let answer = ''
      if ('group' in userObj) {
        const phrases = [
          'О, ты всего первый год, многого еще не знаешь',
          'Отлично, ты на втором курсе, а тебя еще не отчислили. Молодец!',
          'На третьем курсе хочется умереть все больше, да?',
          'Диплом уже готов?'
        ]
        answer = phrases[user.course - 1]
        answer += groupInfo.values.groupHubId ? '' : '\nКстати, расписание твоей группы еще не завезли :c'
      } else {
        answer = 'Давно, конечно, я такой грустной новости не слышал. Но ничего, мы тут всех любим!'
      }

      ctx.session.registry = null
      ctx.state.saveSession()
      ctx.reply(answer, ctx.state.homeMarkup)
    } catch (e) {
      ctx.state.error(e)
    }
  })

  router.on('flow', ctx => {
    const flow = ctx.message.text.trim().toLowerCase()
    ctx.session.flow = flow
    ctx.session.registry.flow = flow
    ctx.session.registry.nextCondition = 'course'
    ctx.state.saveSession()
    ctx.reply('Понял. А на каком ты курсе?')
  })

  router.on('course', ctx => {
    const course = Number(ctx.message.text.trim())
    if (course > 0 && course < 7) {
      try {
        ctx.session.registry.date = new Date()
        const user = new User(ctx.session.registry)
        user.save()

        ctx.reply('Добро пожаловать!', ctx.state.homeMarkup)

        ctx.session.user = user
        ctx.session.course = course
        ctx.session.registry.course = course
        ctx.session.registry.nextCondition = null
        ctx.state.saveSession()
      } catch(e) {
        ctx.state.error(e)
      }
    } else
      ctx.reply('Кто-то кроме тебя учится на этом курсе? Попробуй еще')
  })

  return router.middleware()
}
