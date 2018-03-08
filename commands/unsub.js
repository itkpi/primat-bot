const User = require('../models/user')

module.exports = async ctx => {
  try {
    await User.update({ tgId: ctx.from.id }, { unsubscriber: true })
    ctx.reply('Больше никаких уведомлений! (чтобы подписаться - /sub)')
  } catch (e) {
    ctx.state.error(e)
  }
}
