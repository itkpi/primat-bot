const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const ignoreCommand = require('../../../utils/ignoreCommand')
const abstractService = require('../../../service/abstract')

const sceneName = config.scenes.home.abstracts.loadPhoto
const scene = new Scene(sceneName)

scene.enter(ctx => {
  const msg = 'Словил! Но, вижу, твоей лекции не хватает фотографий. Вот их количество,'
  + ` которое я от тебя жду, чтобы вклеить все на свои места: <b>${ctx.scene.state.pageData.photosAmount}</b>`
  const keyboard = Markup.keyboard([config.btns.cancel]).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})

scene.on('photo', async ctx => {
  const { pageData } = ctx.scene.state
  if (!ctx.scene.state.left) {
    ctx.scene.state.left = pageData.photosAmount
    pageData.photos = []
    pageData.photoLinks = []
  }
  const { photo: photos } = ctx.message
  pageData.photos.push(photos)
  pageData.photoLinks.push(await ctx.telegram.getFileLink(photos[photos.length - 1]))
  ctx.scene.state.left -= 1
  if (ctx.scene.state.left !== 0) {
    return ctx.reply(`Оп, забрал. Еще не достает: <b>${ctx.scene.state.left}</b>`)
  }
  const [sendedMsg, telegraphPage] = await Promise.all([
    ctx.reply('Делаю всю магию...'),
    abstractService.createTelegraphPage(ctx.state.user, pageData),
  ])
  await ctx.telegram.deleteMessage(sendedMsg.chat.id, sendedMsg.message_id)
  return ctx.finishAbstractLoading(telegraphPage)
})

scene.hears(config.btns.cancel, ctx => ctx.home('Лады'))
scene.hears(ignoreCommand, ctx => ctx.reply('Мне нужна только фотография :)'))

module.exports = scene
