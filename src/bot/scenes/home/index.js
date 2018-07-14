const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/home')
const univerService = require('../../service/univer')
const protect = require('../../middlewares/protect')
const convertLinksToMessage = require('../../utils/convertLinksToMessage')

const btns = config.btns.home
const { roles, scenes } = config
const scene = new Scene(scenes.home.self)

scene.enter(ctx => {
  const { msg } = ctx.state
  const keyboard = service.getKeyboard(ctx.session.role, ctx.session.user.role)
  return ctx.replyWithHTML(msg, keyboard)
})

// student role
scene.hears(btns.student.schedule, protect(roles.student), async ctx => {
  const currSemester = await univerService.getCurrSemester()
  if (currSemester !== ctx.session.semester) {
    return ctx.reply('На этот семестр нет расписания. Можешь поменять его в кабинете')
  }
  return ctx.scene.enter(scenes.home.schedule)
})
scene.hears(btns.student.timeleft, protect(roles.student),
  ctx => ctx.reply(service.timeleft()))

scene.hears(btns.student.cabinet, protect(roles.student),
  ctx => ctx.scene.enter(scenes.home.cabinet.self))

scene.hears(btns.student.teachers, protect(roles.student),
  async ctx => ctx.replyWithHTML(await service.teachers(ctx.session.groupId, ctx.session.group)))

scene.hears(btns.student.kpiInternets,
  ctx => ctx.replyWithHTML(convertLinksToMessage(ctx.message.text, { hideDefault: true })))

// abiturient role
scene.hears(btns.abiturient.location, protect(roles.abiturient),
  ctx => ctx.scene.enter(scenes.home.location))

scene.hears(btns.abiturient.setGroup, protect(roles.abiturient, roles.noKPI),
  ctx => ctx.scene.enter(scenes.home.cabinet.changeGroup))

scene.hears(btns.abiturient.abitInternets, protect(roles.abiturient),
  ctx => ctx.replyWithHTML(convertLinksToMessage(ctx.session.role)))

// noKPI role
scene.hears(btns.noKPI.setGroup, protect(roles.noKPI),
  ctx => ctx.scene.enter(scenes.home.cabinet.changeGroup))

scene.hears(btns.other.returnRole, protect(roles.abiturient, roles.noKPI), ctx => {
  ctx.session.role = ctx.session.user.role
  return ctx.home('В родные места')
})

module.exports = scene
