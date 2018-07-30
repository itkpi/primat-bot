const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const service = require('../../../service/cabinet')

const sceneName = config.scenes.home.cabinet.self
const scene = new Scene(sceneName)
const btns = config.btns.cabinet

scene.enter(ctx => {
  const buttons = Object.values(btns)
  if (ctx.state.user.telegraph.accessToken) {
    buttons.unshift(config.btns.ph)
  }
  const keyboard = Markup.keyboard(buttons, { columns: 2 })
    .resize()
    .extra()
  const msg = ctx.state.msg || 'Здесь можешь сделать важные дела'
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
  const info = {
    course: ctx.session.course,
    userCourse: ctx.state.user.course,
    role: ctx.state.user.role,
    semester: ctx.session.semester,
    sessionGroup: ctx.session.group.toUpperCase(),
    userGroup: ctx.state.user.group && ctx.state.user.group.toUpperCase(),
  }
  return ctx.replyWithHTML(service.whoAmI(info))
})
scene.hears(btns.settings, ctx => ctx.scene.enter(config.scenes.home.cabinet.settings))
scene.hears(config.btns.ph, ctx => ctx.scene.enter(config.scenes.home.cabinet.telegraph))
scene.hears(btns.back, ctx => ctx.home())

module.exports = scene
