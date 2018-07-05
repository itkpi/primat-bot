const config = require('config')
const Scene = require('telegraf/scenes/base')
const service = require('../../service/greeter')
const ignoreCommand = require('../../utils/ignoreCommand')

const scene = new Scene(config.scenes.greeter.setCourse)

scene.enter(async ctx => {
  const { msg, keyboard } = ctx.scene.state
  ctx.reply(msg, keyboard)
})
scene.hears(ignoreCommand, async ctx => {
  const course = Number(ctx.message.text.trim().toLowerCase())
  if (!course || course < 1 || course > 6) {
    return ctx.reply('Не уверен, что там кто-то учится. У нас ведь всего шесть курсов? Попробуй еще')
  }
  const { registryData } = ctx.scene.state
  registryData.course = course
  await service.register(registryData, config.roles.student)
  return ctx.finishRegistry()
})

module.exports = scene
