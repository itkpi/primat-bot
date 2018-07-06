const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')

const scene = new Scene(config.scenes.home.self)
const btns = config.btns.home

scene.enter(ctx => {
  const { msg } = ctx.scene.state
  const keyboard = Markup.keyboard(Object.values(btns), { columns: 2 }).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})

scene.hears(btns.schedule, ctx => ctx.scene.enter(config.scenes.home.schedule))

module.exports = scene
