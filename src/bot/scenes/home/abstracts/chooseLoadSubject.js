const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.abstracts.chooseLoadSubject
const scene = new Scene(sceneName)

scene.enter(async ctx => {
  const msg = 'Запас какого предмета ты хотел бы пополнить?'
  const buttons = ctx.scene.state.subjects.concat(config.btns.back)
  const keyboard = Markup.keyboard(buttons, { columns: 3 }).resize().extra()
  return ctx.reply(msg, keyboard)
})

scene.hears(config.btns.back, ctx => ctx.scene.enter(config.scenes.home.abstracts.self))

scene.hears(ignoreCommand, ctx => {
  const subject = ctx.scene.state.subjects.find(item => item === ctx.message.text)
  if (!subject) {
    return ctx.reply('Камон, пользуйся кнопками')
  }
  return ctx.scene.enter(config.scenes.home.abstracts.loadLecture, { subject })
})

module.exports = scene
