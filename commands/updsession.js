const User = require('../models/user'),
      currSem = require('../modules/curr-sem')

module.exports = async ctx => {
    try {
      const user = await User.findOne({ tgId: ctx.from.id })
      if (user) {
        ctx.session.user = user
        ctx.state.clearRoutes()
        config.session_fields.forEach(field => ctx.session[field] = user[field])
        ctx.session.semester = currSem()
        ctx.state.saveSession()
        return ctx.reply('Оп, обновил', ctx.state.homeMarkup)
      }
    } catch(e) {
      return ctx.state.error(e)
    }  
}