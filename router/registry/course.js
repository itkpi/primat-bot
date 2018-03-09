const User = require('../../models/user')

module.exports = ctx => {
  const course = Number(ctx.message.text.trim())

  if (course > 0 && course < 7) {
    try {

      const user = new User(Object.assign({}, ctx.session.registry, { course, nextCondition: undefined, isStudent: true }))
      user.save()

      ctx.state.home('Добро пожаловать!')

      ctx.session.user = user
      ctx.session.course = course
      ctx.state.saveSession()
    } catch (e) {
      ctx.state.error(e)
    }
  } else
    ctx.reply('Кто-то кроме тебя учится на этом курсе? Попробуй еще')
}
