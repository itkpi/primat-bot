const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const telegraph = require('../../../../modules/telegraph')
const userService = require('../../../service/user')
const cabinetService = require('../../../service/cabinet')

const sceneName = config.scenes.home.abstracts.createTelegraph
const scene = new Scene(sceneName)

scene.enter(async ctx => {
  const msg = 'У тебя пока нет отдельного телеграф аккаунта для лекций. '
    + 'Не беспокойся, я создаем его, тебе даже ничего не придется делать'
  const buttons = [config.btns.cancel, config.btns.next]
  return ctx.reply(msg, Markup.keyboard(buttons, { columns: 2 }).resize().extra())
})

scene.hears(config.btns.next, async ctx => {
  const telegraphAccount = await telegraph.createAccount('KPIbot', {
    short_name: `KPIbot-${ctx.from.username || ctx.from.first_name}`,
    author_name: `KPIbot-${ctx.from.username || ctx.from.first_name}`,
    author_url: ctx.from.username ? `https:/t.me/${ctx.from.username}` : '',
  })
  const telegraphData = cabinetService.mapTelegraphInfo(telegraphAccount)
  await userService.update(ctx.from.id, { telegraph: telegraphData })
  ctx.reply('Вот и все, теперь ты тоже в теме телеграфа')
  return ctx.scene.enter(config.scenes.home.abstracts.loadLecture)
})

scene.hears(config.btns.cancel, ctx => ctx.home('Как скажешь'))

module.exports = scene
