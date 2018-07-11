const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/home')
const univerService = require('../../service/univer')
const protect = require('../../middlewares/protect')
const convertLinksToMessage = require('../../utils/convertLinksToMessage')

const scene = new Scene(config.scenes.home.self)
const btns = config.btns.home

scene.enter(ctx => {
  const { msg } = ctx.scene.state
  const keyboard = service.getKeyboard(ctx.session.role)
  return ctx.replyWithHTML(msg, keyboard)
})

// student role
scene.hears(btns.student.schedule, protect(config.roles.student), async ctx => {
  const currSemester = await univerService.getCurrSemester()
  if (currSemester !== ctx.session.semester) {
    return ctx.reply('На этот семестр нет расписания. Можешь поменять его в кабинете')
  }
  return ctx.scene.enter(config.scenes.home.schedule)
})
scene.hears(btns.student.timeleft, protect(config.roles.student),
  ctx => ctx.reply(service.timeleft()))

scene.hears(btns.student.cabinet, protect(config.roles.student),
  ctx => ctx.scene.enter(config.scenes.home.cabinet.self))

scene.hears(btns.student.teachers, protect(config.roles.student),
  async ctx => ctx.replyWithHTML(await service.teachers(ctx.session.groupId, ctx.session.group)))

// abiturient role
scene.hears(btns.abiturient.location, protect(config.roles.abiturient),
  ctx => ctx.scene.enter(config.scenes.home.location))

scene.hears(btns.abiturient.setGroup, protect(config.roles.abiturient),
  ctx => ctx.scene.enter(config.scenes.home.cabinet.changeGroup))

scene.hears(btns.abiturient.abitInternets, protect(config.roles.abiturient),
  ctx => ctx.replyWithHTML(convertLinksToMessage(ctx.session.role)))

module.exports = scene
