const User = require('../models/user')

module.exports = ctx => {
  User.findOneAndUpdate({ tgId: ctx.from.id }, { hideLocation: false })
  ctx.session.hideLocation = false
  ctx.state.saveSession()
  ctx.reply('Теперь ты всегда будешь знать куда идти!\n(/hide_location - скрывать)')
}
