const User = require('../models/user')

module.exports = async ctx => {
  try {
    await User.update(
      { tgId: ctx.from.id },
      { $set: { unsubscriber: false } }
    )
    ctx.reply('Я тебя запомнил!')
  } catch (e) {
    ctx.state.error(e)
  }
}
