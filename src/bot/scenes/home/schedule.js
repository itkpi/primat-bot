const config = require('config')
const Scene = require('telegraf/scenes/base')
const ignoreCommand = require('../../utils/ignoreCommand')

const scene = new Scene(config.scenes.home.schedule)

scene.hears(ignoreCommand, ctx => {
  ctx.reply('schedule')
})

module.exports = scene
