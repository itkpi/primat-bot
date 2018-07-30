const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
// const Abstract = require('../../../../db/models/abstract')
// const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.abstracts.loadPhoto
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const msg = 'Словил! Но, вижу, твоей лекции не хватает фотографий. Вот их количество,'
  + ` которое я от тебя жду, чтобы вклеить все на свои места: <b>${ctx.scene.state.photosAmount}</b>`
  const keyboard = Markup.keyboard([config.btns.cancel]).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})

scene.on('photo', ctx => {
  console.dir(ctx.message, { depth: 100 })
})

scene.hears(config.btns.cancel, ctx => ctx.home('Лады'))

module.exports = scene
