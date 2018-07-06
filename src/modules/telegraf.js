const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

telegraf.context.finishRegistry = function finishRegistry() {
  this.scene.enter(config.scenes.home.self, { msg: config.registryMessage })
}

telegraf.context.home = function home() {
  this.scene.enter(config.scenes.home.self, { msg: getRandomHomeMsg() })
}

module.exports = telegraf
