const msgFromDataToUserData = require('../utils/msgFromDataToUserData')
const greeterService = require('../service/greeter')

module.exports = async ctx => {
  const group = ctx.scene.state.group || ctx.state.cleanedMsg
  const { createUser } = ctx.scene.state
  const userData = msgFromDataToUserData(ctx.message.from)
  const {
    nextScene,
    fail,
  } = await greeterService.registerByGroup(group, userData, createUser)
  if (fail) {
    return ctx.reply(fail)
  }
  if (nextScene) {
    return ctx.scene.enter(nextScene.name, nextScene.state)
  }
  return ctx.finishRegistry()
}
