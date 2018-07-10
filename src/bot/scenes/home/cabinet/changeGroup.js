const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const groupService = require('../../../service/group')
const greeterService = require('../../../service/greeter')
const sessionService = require('../../../service/session')
const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.cabinet.changeGroup
const scene = new Scene(sceneName)

scene.enter(ctx => {
  ctx.reply('К кому пойдем в гости? Назови группу', Markup.keyboard([config.btns.cancel]).resize().extra())
})

scene.hears(ignoreCommand, async ctx => {
  if (ctx.message.text === config.btns.cancel) {
    return ctx.scene.enter(ctx.scenes.home.cabinet.self, { msg: 'В другой раз' })
  }
  const groupData = await groupService.processGroupByName(ctx.state.cleanedMsg)
  if (!groupData) {
    return ctx.reply('По такому адресу никого нет, попробуй другую группу')
  }
  if (Array.isArray(groupData)) {
    const { nextScene } = greeterService.getChooseGroupScene(groupData)
    const state = Object.assign({}, nextScene.state, { parent: sceneName })
    return ctx.scene.enter(nextScene.name, state)
  }
  sessionService.setByGroup(groupData, ctx.session)
  return ctx.scene.enter(config.scenes.home.cabinet.self, { msg: 'Все готово' })
})

module.exports = scene
