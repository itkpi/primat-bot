const config = require('config')
const msgFromDataToUserData = require('../utils/msgFromDataToUserData')
const greeterService = require('../service/greeter')

module.exports = async ctx => {
  if (ctx.state.userData) {
    const user = await greeterService.register(ctx.state.userData, config.roles.student)
    return ctx.finishRegistry(user)
  }
  const group = ctx.state.group || ctx.state.cleanedMsg
  const userData = msgFromDataToUserData(ctx.message.from)
  const {
    nextScene,
    currState,
    fail,
    user,
  } = await greeterService.registerByGroup(group, userData)
  if (fail) {
    return ctx.reply(fail)
  }
  if (nextScene) {
    ctx.state = currState
    return ctx.scene.enter(nextScene.name, nextScene.state)
  }
  return ctx.finishRegistry(user)
}
