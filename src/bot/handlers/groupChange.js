const config = require('config')
const groupService = require('../service/group')
const greeterService = require('../service/greeter')
const sessionService = require('../service/session')

function finish(ctx, groupData) {
  sessionService.setByGroup(groupData, ctx.session)
  ctx.state.msg = 'Все готово'
  return ctx.scene.enter(config.scenes.home.self)
}

function handleScene(ctx, getScene, groupData) {
  const { nextScene, currState } = getScene.call(greeterService, groupData, { showCancel: true })
  ctx.state = currState
  const parent = config.scenes.home.cabinet.changeGroup
  const sceneState = Object.assign({}, nextScene.state, { parent })
  return ctx.scene.enter(nextScene.name, sceneState)
}

module.exports = async ctx => {
  if (ctx.message.text === config.btns.cancel) {
    return ctx.home('В другой раз')
  }
  if (ctx.state.groupData) {
    return finish(ctx, ctx.state.groupData)
  }
  const group = ctx.state.group || ctx.state.cleanedMsg
  const groupData = await groupService.processGroup(group)
  if (!groupData) {
    return ctx.reply('По такому адресу никого нет, попробуй другую группу')
  }
  if (Array.isArray(groupData)) {
    return handleScene(ctx, greeterService.getChooseGroupScene, groupData)
  }
  if (!groupData.course) {
    return handleScene(ctx, greeterService.getSetCourseScene, groupData)
  }
  return finish(ctx, groupData)
}
