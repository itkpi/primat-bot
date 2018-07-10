const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const service = require('../../service/home')
const univerService = require('../../service/univer')

const scene = new Scene(config.scenes.home.self)
const btns = config.btns.home

scene.enter(ctx => {
  const { msg } = ctx.scene.state
  const keyboard = Markup.keyboard(Object.values(btns), { columns: 2 }).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})
scene.hears(btns.schedule, async ctx => {
  const currSemester = await univerService.getCurrSemester()
  if (currSemester !== ctx.session.semester) {
    return ctx.reply('На этот семестр нет расписания. Можешь поменять его в кабинете')
  }
  return ctx.scene.enter(config.scenes.home.schedule)
})
scene.hears(btns.cabinet, ctx => ctx.scene.enter(config.scenes.home.cabinet.self))
scene.hears(btns.timeleft, ctx => ctx.reply(service.timeleft()))
scene.hears(btns.teachers,
  async ctx => ctx.replyWithHTML(await service.teachers(ctx.session.groupId, ctx.session.group)))

module.exports = scene
