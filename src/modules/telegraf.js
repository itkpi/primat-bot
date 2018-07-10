const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

module.exports = telegraf

const setSession = require('../bot/utils/setSession')

telegraf.context.finishRegistry = async function finishRegistry() {
  await setSession(this.session.tgId, this.session)
  delete this.session.tgId
  this.scene.enter(config.scenes.home.self, { msg: config.registryMessage })
}

telegraf.context.home = function home(msg = getRandomHomeMsg()) {
  this.scene.enter(config.scenes.home.self, { msg })
}
