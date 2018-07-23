const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const service = require('../../service/schedule')

const scene = new Scene(config.scenes.home.schedule)
const btns = config.btns.schedule

async function dayHandler(ctx) {
  const lessons = await service.getLessons(ctx.session.groupId, ctx.message.text, { parse: true })
  if (!lessons) {
    return ctx.reply('А вот и выходной - ни одной пары!')
  }
  await ctx.replyWithHTML(lessons.text)
  const showLocationSettingOn = ctx.session.user.settings[config.settings.scheduleLocationShowing]
  if (lessons.buildings.length > 0 && showLocationSettingOn) {
    ctx.reply(config.seeBuildingLocationMsg, service.getBuildingsLocationMarkup(lessons.buildings))
  }
  return true
}

scene.enter(ctx => {
  const keyboard = Markup.keyboard(Object.values(btns), { columns: 2 })
    .resize()
    .extra()
  return ctx.reply('Выбирай нужное', keyboard)
})
scene.hears(btns.today, dayHandler)
scene.hears(btns.tomorrow, dayHandler)
scene.hears(btns.yesterday, dayHandler)
scene.hears(btns.thisWeek, dayHandler)
scene.hears(btns.nextWeek, dayHandler)
scene.hears(btns.whole, dayHandler)

scene.hears(btns.lessons, ctx => ctx.replyWithHTML(service.time))
scene.hears(btns.back, ctx => ctx.home())

module.exports = scene
