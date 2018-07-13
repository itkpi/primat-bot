const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../../utils/ignoreCommand')
const handleGroupChange = require('../../../handlers/groupChange')

const sceneName = config.scenes.home.cabinet.changeGroup
const scene = new Scene(sceneName)

scene.enter(ctx => ctx.reply('К кому пойдем в гости? Назови группу',
  Markup.keyboard([config.btns.cancel]).resize().extra()))

scene.hears(ignoreCommand, handleGroupChange)

module.exports = scene
