const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

telegraf.context.home = function home(msg = getRandomHomeMsg()) {
  this.state.msg = msg
  return this.scene.enter(config.scenes.home.self)
}

module.exports = telegraf
