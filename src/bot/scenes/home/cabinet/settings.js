const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const userService = require('../../../service/user')

const { settings } = config.btns
const sceneName = config.scenes.home.cabinet.settings
const scene = new Scene(sceneName)

function getSettingsKeyboard(userSettings) {
  delete userSettings.$init
  const buttons = []
  Object.entries(userSettings).forEach(([setting, value]) => {
    buttons.push(value ? settings.off[setting] : settings.on[setting])
  })
  buttons.sort((a, b) => a.split('').reverse() > b.split('').reverse())
  buttons.push(config.btns.back)
  return Markup.keyboard(buttons, { columns: 2 }).extra()
}

const settingHandler = (setting, value, msg) => async ctx => {
  const user = await userService.setSetting(ctx.from.id, setting, value)
  return ctx.reply(msg, getSettingsKeyboard(user.settings))
}

scene.enter(ctx => {
  const keyboard = getSettingsKeyboard(ctx.state.user.settings)
  return ctx.reply('Оп, настроечки', keyboard)
})

scene.hears(config.btns.back, ctx => ctx.scene.enter(config.scenes.home.cabinet.self))

scene.hears(settings.off.scheduleLocationShowing,
  settingHandler(config.settings.scheduleLocationShowing, false, 'Оп, скрыл'))
scene.hears(settings.on.scheduleLocationShowing,
  settingHandler(config.settings.scheduleLocationShowing, true, 'Оп, раскрыл'))

scene.hears(settings.off.abstractSubscriber,
  settingHandler(config.settings.abstractSubscriber, false, 'Окей, никаких уведомлений о лекциях'))
scene.hears(settings.on.abstractSubscriber,
  settingHandler(config.settings.abstractSubscriber, true, 'Ты будешь узнавать о новых лекциях первым!'))

module.exports = scene
