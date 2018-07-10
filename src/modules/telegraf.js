const config = require('config')
const Telegraf = require('telegraf')
const getRandomHomeMsg = require('../bot/utils/getRandomHomeMsg')

const telegraf = new Telegraf(config.botToken) // , { telegram: { webhookReply: false } })

telegraf.extendContext = (userService, univerService) => {
  telegraf.context.finishRegistry = async function finishRegistry() {
    this.session.user = await userService.getByTgId(this.session.tgId)
    delete this.session.tgId
    this.session.groupId = this.session.user.groupId
    this.session.course = this.session.user.course
    this.session.semester = await univerService.getCurrSemester()
    this.scene.enter(config.scenes.home.self, { msg: config.registryMessage })
  }

  telegraf.context.home = function home(msg = getRandomHomeMsg()) {
    this.scene.enter(config.scenes.home.self, { msg })
  }
}

module.exports = telegraf
