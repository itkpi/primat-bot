const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../../utils/ignoreCommand')
const handleUpgradeStudent = require('../../../handlers/upgradeStudent')

const scene = new Scene(config.scenes.home.studentUpgrade.self)

scene.enter(ctx => {
  const msg = ctx.state.nextMsg
    || 'Если ты все же смог поступить в этот универ, тогда вводи название своей новой группы'
  const keyboard = Markup.keyboard([config.btns.cancel]).resize().extra()
  return ctx.reply(msg, keyboard)
})

scene.hears(ignoreCommand, handleUpgradeStudent)

module.exports = scene
