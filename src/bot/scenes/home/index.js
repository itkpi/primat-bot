const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/home')
const univerService = require('../../service/univer')
const scheduleService = require('../../service/schedule')
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
scene.hears(btns.student.schedule, protect(roles.student, { forward: true }), async (ctx, next) => {
  if (ctx.state.skip) {
    return next()
  }
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

scene.hears(btns.student.abstracts, protect(config.roles.student),
  ctx => ctx.scene.enter(scenes.home.abstracts.self))

// abiturient role
scene.hears(btns.abiturient.location, protect(roles.abiturient),
  ctx => ctx.scene.enter(scenes.home.location))

scene.hears(btns.abiturient.setGroup, protect(roles.abiturient, roles.noKPI, roles.teacher),
  ctx => ctx.scene.enter(scenes.home.cabinet.changeGroup))

scene.hears(btns.abiturient.abitInternets, protect(roles.abiturient),
  ctx => ctx.replyWithHTML(convertLinksToMessage(ctx.session.role)))

scene.hears(btns.abiturient.studentUpgrade, protect(roles.abiturient),
  ctx => ctx.scene.enter(scenes.home.studentUpgrade.self))

// teacher role
scene.hears(btns.teacher.schedule, protect(roles.teacher), async ctx => {
  const lessons = await scheduleService.teacherLessons(ctx.session.user.teacherId)
  await ctx.replyWithHTML(lessons.text)
  if (lessons.buildings.length > 0 && !ctx.session.user.settings.hideLocationBtns) {
    const markup = scheduleService.getBuildingsLocationMarkup(lessons.buildings)
    ctx.reply(config.seeBuildingLocationMsg, markup)
  }
})

// noKPI role
scene.hears(btns.noKPI.setGroup, protect(roles.noKPI),
  ctx => ctx.scene.enter(scenes.home.cabinet.changeGroup))

scene.hears(btns.other.returnRole,
  protect(roles.abiturient, roles.noKPI, roles.teacher, { native: true }),
  ctx => {
    if (ctx.session.role === ctx.session.user.role) {
      return false
    }
    ctx.session.role = ctx.session.user.role
    return ctx.home('В родные места')
  })

module.exports = scene
