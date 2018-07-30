const config = require('config')
const got = require('got')
const Scene = require('telegraf/scenes/base')
// const objectMapper = require('object-mapper')
const { Markup } = require('telegraf')
// const telegraph = require('../../../../modules/telegraph')
// const userService = require('../../../service/user')
// const sessionService = require('../../../service/session')
const abstractService = require('../../../service/abstract')
const ignoreCommand = require('../../../utils/ignoreCommand')
// const getPicasaAccessToken = require('../../../utils/getPicasaAccessToken')

const sceneName = config.scenes.home.abstracts.loadLecture
const scene = new Scene(sceneName)

scene.enter(async ctx => {
  const msg = 'Понял-принял. Теперь скидывай свой файл с лекцией'
  return ctx.reply(msg, Markup.keyboard([config.btns.cancel]).resize().extra())
})

scene.on('document', async ctx => {
  if (!['text/html', 'text/plain'].includes(ctx.message.document.mime_type)) {
    return ctx.reply('Я понимаю только html лекции')
  }
  const lectureLink = await ctx.telegram.getFileLink(ctx.message.document.file_id)
  const { body: lectureText } = await got(lectureLink)
  const pageData = abstractService.parse(lectureText)
  pageData.subject = ctx.scene.state.subject
  if (pageData.photosAmount > 0 || pageData.latexExpressions.length > 0) {
    pageData.picasaToken = await abstractService.getPicasaAccessToken()
  }
  if (pageData.latexExpressions.length > 0) {
    pageData.latexPhotoLinks = await abstractService.uploadLatexExpressions(pageData)
  }
  if (pageData.photosAmount > 0) {
    return ctx.scene.enter(config.scenes.home.abstracts.loadPhoto, Object.assign({}, { pageData }))
  }
  const response = await abstractService.createTelegraphPage(ctx.from.id, pageData)
  return ctx.reply('Ты просто лучший! Только не забывай исправлять ошибки, вдруг что\n\n' + response.url)
})

scene.hears(config.btns.cancel, ctx => ctx.home('Как скажешь'))
scene.hears(ignoreCommand, ctx => ctx.reply('Мне нужен только файл :)'))

module.exports = scene
