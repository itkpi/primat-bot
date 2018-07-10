const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')

const sceneName = config.scenes.home.cabinet.self
const scene = new Scene(sceneName)
const btns = config.btns.cabinet

scene.enter(ctx => {
  const keyboard = Markup.keyboard(Object.values(btns), { columns: 2 })
    .resize()
    .extra()
  const msg = ctx.scene.state.msg || 'Здесь можешь сделать важные дела'
  return ctx.reply(msg, keyboard)
})
scene.hears(btns.changeGroup, ctx => ctx.scene.enter(config.scenes.home.cabinet.changeGroup))
scene.hears(btns.changeSemester, ctx => {
  const currSemester = ctx.session.semester
  const newSemester = (currSemester + 1) % 3
  ctx.session.semester = newSemester || 1
  ctx.reply(`Ты благополучно покинул ${currSemester}-й семестр, сменив его на ${ctx.session.semester}-й`)
})
scene.hears(btns.whoAmI, ctx => {
  ctx.reply('Кто-то')
})
scene.hears(btns.back, ctx => ctx.home())

module.exports = scene
