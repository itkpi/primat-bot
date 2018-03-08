const User = require('../models/user'),
      currSem = require('../modules/curr-sem'),
      config = require('../config')

module.exports = async ctx => {
  try {
    const user = await User.findOne({ tgId: ctx.from.id })
    if (user) {
      if (user.isStudent)
        config.session_fields.forEach(field => ctx.session[field] = user[field])

      ctx.session.semester = currSem()
      ctx.session.user = user

      return ctx.state.home('Оп, обновил')
    }
  } catch (e) {
    return ctx.state.error(e)
  }
}
