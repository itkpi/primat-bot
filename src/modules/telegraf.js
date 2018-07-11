const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')
const convertLinksToMessage = require('../bot/utils/convertLinksToMessage')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

module.exports = telegraf

const sessionService = require('../bot/service/session')

telegraf.context.home = function home(msg = getRandomHomeMsg()) {
  return this.scene.enter(config.scenes.home.self, { msg })
}

telegraf.context.finishRegistry = async function finishRegistry() {
  await sessionService.setByUser(this.session.tgId, this.session)
  delete this.session.tgId
  const msg = 'Вот и все, теперь ты с нами. Не отказывай себе ни в чем\n\n'
  return this.home(msg + convertLinksToMessage(this.session.role))
}
