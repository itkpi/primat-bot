const config = require('../config')

module.exports = ctx => {
  if (config.ownerId == ctx.from.id) {
    ctx.session = null
    ctx.state.saveSession()
    ctx.reply('session has deleted', ctx.state.homeMarkup)
  }
}
