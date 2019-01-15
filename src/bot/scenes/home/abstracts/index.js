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
  const buttons = subjects.slice()
  const { role: userRole, group: userGroup } = ctx.state.user
  const { group: sessionGroup, semester: sessionSemester } = ctx.session
  if (userRole === config.roles.student && userGroup === sessionGroup) {
    buttons.push(config.btns.loadLecture)
  }
  buttons.push(config.btns.myLectures)
  buttons.push(config.btns.back)
  const keyboard = Markup.keyboard(buttons, { columns: 2 }).resize().extra()
  if (subjects.length === 0) {
    let msg = `Увы, в группе <b>${sessionGroup.toUpperCase()}</b> за ${sessionSemester}-й семестр учебного года нет никаких лекций.\n`
    if (sessionGroup === userGroup) {
      msg += 'Но ты всегда можешь загрузить первую!'
    }
    return ctx.replyWithHTML(msg, keyboard)
  }
  return ctx.reply('Выбирай предмет', keyboard)
})

scene.hears(config.btns.loadLecture, protect(config.roles.student), async ctx => {
  if (ctx.session.groupId !== ctx.state.user.groupId) {
    const msg = 'Увы, но загружать лекции можно только от лица своей группы. '
      + 'Можешь вернуть свою группу в кабинете'
    return ctx.reply(msg)
  }
  const subjects = await scheduleService.parseSchedule(ctx.state.user.groupId, 'subjects')
  if (subjects.length === 0) {
    return ctx.reply('Сорян, не смог найти ни единого предмета твоей группы :c')
  }
  if (!ctx.state.user.allowLectureUpload) {
    const msg = 'У тебя пока нет доступа к загрузке. Свяжись с @Fowi3, чтобы получить его'
    return ctx.reply(msg)
  }
  if (!ctx.state.user.telegraph.accessToken) {
    return ctx.scene.enter(config.scenes.home.abstracts.createTelegraph)
  }
  return ctx.scene.enter(config.scenes.home.abstracts.chooseLoadSubject, { subjects })
})

scene.hears(config.btns.myLectures, async ctx => {
  const abstracts = await Abstract.find({ authorId: ctx.from.id })
  if (abstracts.length === 0) {
    return ctx.reply('Ты не написал еще ни одной лекции, пора бы это исправить')
  }
  const variants = abstracts.reduce((acc, item) => {
    const variant = {
      course: item.course,
      semester: item.semester,
    }
    if (!acc.find(elem => elem.course === variant.course && elem.semester === variant.semester)) {
      acc.push(variant)
    }
    return acc
  }, [])
  if (variants.length !== 0) {
    return ctx.scene.enter(config.scenes.home.abstracts.checkOwnLectures, { variants })
  }
  for (let i = 0; i < abstracts.length; i += 1) {
    await ctx.reply(abstracts[i].url) // eslint-disable-line no-await-in-loop
  }
  const [variant] = variants
  return ctx.reply(`Держи, это лекции за ${variant.course} курс, ${variant.semester} семестр`)
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
