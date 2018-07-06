const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const service = require('../../service/schedule')
// const ignoreCommand = require('../../utils/ignoreCommand')

const scene = new Scene(config.scenes.home.schedule)
const btns = config.btns.schedule

scene.enter(ctx => {
  const keyboard = Markup.keyboard(Object.values(btns), { columns: 2 })
    .resize()
    .extra()
  return ctx.reply('Выбирай нужное', keyboard)
})
scene.hears(btns.today, ctx => {})
scene.hears(btns.tomorrow, ctx => {})
scene.hears(btns.yesterday, ctx => {})
scene.hears(btns.thisWeek, ctx => {})
scene.hears(btns.nextWeek, ctx => {})
scene.hears(btns.lessons, ctx => ctx.replyWithHTML(service.time))
scene.hears(btns.back, ctx => ctx.home())

module.exports = scene
