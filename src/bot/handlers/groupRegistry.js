const config = require('config')
const msgFromDataToUserData = require('../utils/msgFromDataToUserData')
const getRegMsg = require('../../utils/getRegMsg')
const greeterService = require('../service/greeter')

module.exports = async ctx => {
  if (ctx.state.userData) {
    await greeterService.register(ctx.state.userData, config.roles.student, ctx.session)
    return ctx.home(getRegMsg(ctx.session.role))
  }
  const group = ctx.state.group || ctx.state.cleanedMsg
  const userData = msgFromDataToUserData(ctx.message.from)
  const {
    nextScene,
    currState,
    fail,
  } = await greeterService.registerByGroup(group, userData, ctx.session)
  if (fail) {
    return ctx.reply(fail)
  }
  if (nextScene) {
    ctx.state = currState
    return ctx.scene.enter(nextScene.name, nextScene.state)
  }
  return ctx.home(getRegMsg(ctx.session.role))
}
