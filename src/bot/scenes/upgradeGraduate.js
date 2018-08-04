const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../utils/ignoreCommand')
const handleGraduate = require('../handlers/graduate')
const userService = require('../service/user')
const protect = require('../middlewares/protect')

const scene = new Scene(config.scenes.upgradeGraduate)

scene.enter(ctx => {
  if (ctx.state.user.role === config.roles.bachelor) {
    const msg = 'Судя по всему, ты уже бакалавр! Мои поздравления.\n\nЕсли ты решил дальше учиться, '
      + 'назови свою новую группу чтобы я ее записал'
    const keyboard = Markup.keyboard([config.btns.rejectUpgradeToMaster]).resize().extra()
    return ctx.reply(msg, keyboard)
  }
  if (ctx.state.user.role === config.roles.master) {
    const msg = 'Судя по всему, вот и закочилась твоя университетская жизнь - ты уже магистр. Удачи тебе!'
    const keyboard = Markup.keyboard([config.btns.next]).resize().extra()
    return ctx.reply(msg, keyboard)
  }
  return false
})

scene.hears(config.btns.rejectUpgradeToMaster, protect(config.roles.bachelor), async ctx => {
  await userService.update(ctx.from.id, { upgradedGraduate: true })
  return ctx.home('Ну что же, удачи в жизни!')
})

scene.hears(config.btns.next, protect(config.roles.master), async ctx => {
  await userService.update(ctx.from.id, { upgradedGraduate: true })
  return ctx.home('Ну погнали')
})

scene.hears(ignoreCommand, protect(config.roles.bachelor), handleGraduate)

module.exports = scene
