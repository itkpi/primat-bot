const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const Abstract = require('../../../../db/models/abstract')
const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.abstracts.checkOwnLectures
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const getBtn = item => `${item.course} курс - ${item.semester} семестр`
  const variants = ctx.scene.state.variants
    .map(item => Object.assign({}, item, { btn: getBtn(item) }))
  ctx.scene.state.variants = variants
  const buttons = variants.map(item => item.btn).concat(config.btns.back)
  const keyboard = Markup.keyboard(buttons, { columns: 2 }).resize().extra()
  return ctx.reply('Выбери лекции за конкретный период', keyboard)
})

scene.hears(config.btns.back, ctx => ctx.scene.enter(config.scenes.home.abstracts.self))

scene.hears(ignoreCommand, async ctx => {
  const variant = ctx.scene.state.variants.find(item => item.btn === ctx.message.text)
  if (!variant) {
    return ctx.reply('Выбери что-то')
  }
  const query = {
    authorId: ctx.from.id,
    course: variant.course,
    semester: variant.semester,
  }
  const abstracts = await Abstract.find(query)
  for (let i = 0; i < abstracts.length; i += 1) {
    await ctx.reply(abstracts[i].toObject().url) // eslint-disable-line no-await-in-loop
  }
  return ctx.reply('Держи, ничего в мире нет более ценного, чем это')
})

module.exports = scene
