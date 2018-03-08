const User = require('../models/user')

module.exports = ctx => {
  User.findOneAndUpdate({ tgId: ctx.from.id }, { hideLocation: true })
  ctx.session.hideLocation = true
  ctx.state.saveSession()
  ctx.reply('Видимо, местоположение корпусов ты уже запомнил. Отлично!\n(/show_location - отображать)')
}
