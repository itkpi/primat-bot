const config = require('config')
const Scene = require('telegraf/scenes/base')
const Abstract = require('../../../../db/models/abstract')
const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.abstracts.chooseAbstracts
const scene = new Scene(sceneName)

scene.hears(config.btns.back, ctx => ctx.scene.enter(config.scenes.home.abstracts.self))

scene.hears(ignoreCommand, async ctx => {
  const num = parseInt(ctx.message.text, 10) || ctx.message.text.trim()
  if (typeof num !== 'number' && num !== config.btns.all) {
    return ctx.reply('Странные у тебя цифры, попробуй другие')
  }
  const skip = num === config.btns.all ? 0 : num - 1
  const limit = num === config.btns.all ? 0 : 1
  const query = {
    subject: ctx.scene.state.subject,
    course: ctx.session.course,
    flow: ctx.session.flow,
    semester: ctx.session.semester,
  }
  const abstracts = await Abstract.find(query, { telegraph_url: 1 })
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit)
  if (abstracts.length === 0) {
    return ctx.reply('Лекции под таким номером нет, попробуй еще раз')
  }
  for (let i = 0; i < abstracts.length; i += 1) {
    await ctx.reply(abstracts[i].telegraph_url) // eslint-disable-line no-await-in-loop
  }
  return ctx.reply(`Держи, бро\n+${abstracts.length} к защите от отчисления`)
})

module.exports = scene
