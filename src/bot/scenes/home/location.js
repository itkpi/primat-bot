const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../utils/ignoreCommand')
const Building = require('../../../db/models/building')
const { telegram } = require('../../../modules/telegraf')

const scene = new Scene(config.scenes.home.location)

scene.enter(ctx => ctx.reply('Вводи номер корпуса, который тебя интересует',
  Markup.keyboard([config.btns.back]).resize().extra()))
scene.hears(ignoreCommand, async ctx => {
  if (ctx.message.text === config.btns.back) {
    return ctx.home('Оке')
  }
  const num = parseInt(ctx.state.cleanedMsg, 10)
  if (!num) {
    return ctx.reply('Это не очень похоже на номер, попробуй еще')
  }
  const building = await Building.findOne({ name: num })
  if (!building) {
    return ctx.reply('Этого корпуса в университете еще нет ._.')
  }
  return telegram.sendLocation(ctx.from.id, building.latitude, building.longitude)
})

module.exports = scene
