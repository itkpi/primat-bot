const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const Abstract = require('../../../../db/models/abstract')
const ignoreCommand = require('../../../utils/ignoreCommand')
const scheduleService = require('../../../service/schedule')
const protect = require('../../../middlewares/protect')

const sceneName = config.scenes.home.abstracts.self
const scene = new Scene(sceneName)

scene.enter(async ctx => {
  const subjects = await Abstract.distinct('subject', {
    course: ctx.session.course,
    flow: ctx.session.flow,
    semester: ctx.session.semester,
  })
  const buttons = subjects
  if (ctx.session.user.role === config.roles.student) {
    buttons.push(config.btns.loadLecture)
  }
  buttons.push(config.btns.back)
  const keyboard = Markup.keyboard(buttons, { columns: 2 }).resize().extra()
  if (subjects.length === 0) {
    const { group, semester } = ctx.session
    const msg = `Увы, в группе <b>${group.toUpperCase()}</b> за ${semester}-й семестр нет никаких лекций.\n`
      + 'Но ты всегда можешь загрузить первую!'
    return ctx.replyWithHTML(msg, keyboard)
  }
  return ctx.reply('Выбирай предмет', keyboard)
})

scene.hears(config.btns.loadLecture, protect(config.roles.student), async ctx => {
  if (ctx.from.id !== config.adminId) {
    const msg = 'Пока некуда торопиться. Учебный год еще не начался, отдыхай :)'
    return ctx.reply(msg)
  }
  if (ctx.session.groupId !== ctx.session.user.groupId) {
    const msg = 'Увы, но загружать лекции можно только от лица своей группы. '
      + 'Можешь вернуть свою группу в кабинете'
    return ctx.reply(msg)
  }
  const subjects = await scheduleService.parseSchedule(ctx.session.user.groupId, 'subjects')
  if (subjects.length === 0) {
    return ctx.home('Сорян, не смог найти ни единого предмета твоей группы :c')
  }
  if (!ctx.session.user.telegraph) {
    return ctx.scene.enter(config.scenes.home.abstracts.setTelegraphToken)
  }
  return ctx.scene.enter(config.scenes.home.abstracts.chooseLoadSubject, { subjects })
})

scene.hears(config.btns.back, ctx => ctx.home('Знания - сила!'))

scene.hears(ignoreCommand, async ctx => {
  const subject = ctx.message.text.trim()
  const count = await Abstract.count({
    subject,
    course: ctx.session.course,
    flow: ctx.session.flow,
    semester: ctx.session.semester,
  })
  if (!count) {
    return ctx.reply('Выбери что-то')
  }
  const buttons = new Array(count)
  for (let i = 0; i < buttons.length; i += 1) {
    buttons[i] = String(i + 1)
  }
  if (count > 1) {
    buttons.push(config.btns.all)
  }
  buttons.push(config.btns.back)
  ctx.reply('Теперь номер лекции', Markup.keyboard(buttons, { columns: 4 }).resize().extra())
  return ctx.scene.enter(config.scenes.home.abstracts.chooseAbstracts, { subject })
})

module.exports = scene
