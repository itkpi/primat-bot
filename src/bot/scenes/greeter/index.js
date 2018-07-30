const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/greeter')
const handleGroupRegistry = require('../../handlers/groupRegistry')
const msgFromDataToUserData = require('../../utils/msgFromDataToUserData')
const ignoreCommand = require('../../utils/ignoreCommand')
const getRegMsg = require('../../../utils/getRegMsg')

const scene = new Scene(config.scenes.greeter.self)
const btns = config.btns.greeter
const { roles } = config

const handler = role => async ctx => {
  const userData = msgFromDataToUserData(ctx.message.from)
  const user = await service.register(userData, role, ctx.session)
  ctx.state.user = user
  return ctx.home(getRegMsg(user.role))
}

scene.enter(ctx => {
  const { msg, keyboard } = service.welcome(ctx.from.first_name)
  return ctx.replyWithHTML(msg, keyboard)
})
scene.hears(btns.abiturient, handler(roles.abiturient))
scene.hears(btns.noKPI, handler(roles.noKPI))
scene.hears(btns.teacher, async ctx => {
  ctx.state.msg = 'Для регистрации и аутентификации введите полностью ФИО (на украинском)'
  ctx.state.keyboard = config.removeMarkup
  return ctx.scene.enter(config.scenes.greeter.teacher)
})
scene.hears(ignoreCommand, handleGroupRegistry)

module.exports = scene
