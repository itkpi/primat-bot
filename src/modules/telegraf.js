const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

telegraf.context.home = function home(msg = getRandomHomeMsg()) {
  this.state.msg = msg
  return this.scene.enter(config.scenes.home.self)
}

telegraf.context.finishAbstractLoading = function finishAbstractLoading(telegraphPage) {
  return this.home('Ты просто лучший! Только не забывай исправлять ошибки, вдруг что\n\n' + telegraphPage.url)
}

module.exports = telegraf
