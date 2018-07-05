const config = require('config')
const Telegraf = require('telegraf')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

telegraf.context.finishRegistry = function finishRegistry() {
  this.scene.enter(config.scenes.home.self, { msg: config.registryMessage })
}

module.exports = telegraf
