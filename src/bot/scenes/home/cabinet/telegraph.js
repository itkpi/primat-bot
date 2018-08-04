const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const telegraph = require('../../../../modules/telegraph')
const cabinetService = require('../../../service/cabinet')
const userService = require('../../../service/user')

const sceneName = config.scenes.home.cabinet.telegraph
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const buttons = Object.values(config.btns.telegraph)
  const keyboard = Markup.keyboard(buttons, { columns: 2 }).resize().extra()
  return ctx.reply('А здесь все для Телеграфа', keyboard)
})

scene.hears(config.btns.telegraph.authUrl, async ctx => {
  const { accessToken } = ctx.state.user.telegraph
  const { auth_url: authUrl } = await telegraph.getAccountInfo(accessToken, { fields: ['auth_url'] })
  const upd = Object.assign({}, ctx.state.user.toObject().telegraph, { authUrl })
  await userService.update(ctx.from.id, { telegraph: upd })
  const msg = 'Вот линк для авторизации в твоем телеграф аккаунте от меня. После авторизации '
    + 'ты сможешь редактировать свои лекции\n\n' + authUrl
  return ctx.reply(msg)
})

scene.hears(config.btns.telegraph.info, async ctx => {
  const { accessToken } = ctx.state.user.telegraph
  const query = { fields: ['short_name', 'author_name', 'author_url', 'page_count'] }
  const info = cabinetService.mapTelegraphInfo(await telegraph.getAccountInfo(accessToken, query))
  ctx.reply(cabinetService.getTelegraphInfoMsg(info))
  const upd = Object.assign({}, ctx.state.user.toObject().telegraph, info)
  await userService.update(ctx.from.id, { telegraph: upd })
})

scene.hears(config.btns.back, ctx => {
  ctx.state.msg = 'Удачи!'
  return ctx.scene.enter(config.scenes.home.cabinet.self)
})

module.exports = scene
