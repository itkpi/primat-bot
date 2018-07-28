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
const getPicasaAccessToken = require('../../../utils/getPicasaAccessToken')

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
  const {
    page,
    lectureName,
    photosAmount,
    latexExpressions,
  } = abstractService.parse(lectureText)

  const picasaToken = (photosAmount > 0 || latexExpressions.length > 0)
    ? await getPicasaAccessToken()
    : null

  const pageData = {
    page,
    lectureName,
    picasaToken,
    photosAmount,
    latexExpressions,
    photoLinks: [],
    subject: ctx.scene.state.subject,
  }

  if (photosAmount > 0) {
    ctx.scene.state.pageData = pageData
    // ctx.session.cabinet = Object.assign({}, pageData, { nextCondition: 'photo' })
    return ctx.scene.enter(config.scenes.home.abstracts.loadPhoto)
  }
  // const latexPicasaLinks = await abstractService.getPhotosFromLatex(ctx.session.user, pageData)
  // const response = await createPage(ctx, lectureName, page, { latexPicasaLinks })

  return ctx.reply('Ты просто лучший! Только не забывай исправлять ошибки, вдруг что')
  // return ctx.state.home(response.url)
})

scene.hears(config.btns.cancel, ctx => ctx.home('Как скажешь'))
scene.hears(ignoreCommand, ctx => ctx.reply('Мне нужен только файл :)'))

module.exports = scene
