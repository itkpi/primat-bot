const config = require('config')
const { Markup } = require('telegraf')
const userService = require('../service/user')
const groupService = require('../service/group')
const greeterService = require('../service/greeter')
const sessionService = require('../service/session')

module.exports = async ctx => {
  if (ctx.message.text === config.btns.cancel) {
    return ctx.home('Повезет в другой раз')
  }
  const group = ctx.state.group || ctx.state.cleanedMsg
  const groupData = await groupService.processGroup(group)
  if (!groupData) {
    return ctx.reply('Первый раз слышу такую группу, попробуй еще раз')
  }
  if (Array.isArray(groupData)) {
    const sceneOps = { showCancel: true }
    const { nextScene, currState } = greeterService.getChooseGroupScene(groupData, sceneOps)
    ctx.state = currState
    const parent = config.scenes.home.studentUpgrade.self
    const sceneState = Object.assign({}, nextScene.state, { parent })
    return ctx.scene.enter(nextScene.name, sceneState)
  }
  const { course } = groupData
  if (course && course !== 1) {
    return ctx.reply('Мне кажется эта группа не для первого курса, пробуй еще')
  }
  if (!course) {
    const keyboard = Markup.keyboard([config.btns.yes, config.btns.no]).resize().extra()
    ctx.state.nextMsg = {
      text: 'Ты уверен, что это первый курс?',
      keyboard,
    }
    return ctx.scene.enter(config.scenes.home.studentUpgrade.confirmGroup, { groupData })
  }
  const user = await userService.upgradeAbiturientToStudent(ctx.from.id, groupData)
  await sessionService.setByUser(user, ctx.session)
  return ctx.home('Поздравляю, больше ты не абитуриент!')
}
