const config = require('config')
const got = require('got')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const abstractService = require('../../../service/abstract')
const ignoreCommand = require('../../../utils/ignoreCommand')
const logger = require('../../../../utils/logger')

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
  const [sendedMsg, lectureLink] = await Promise.all([
    ctx.reply('Секундочку...'),
    ctx.telegram.getFileLink(ctx.message.document.file_id),
  ])
  logger.debug('sendedMsg', sendedMsg)
  const { body: lectureText } = await got(lectureLink)
  const pageData = abstractService.parse(lectureText)
  pageData.subject = ctx.scene.state.subject
  if (pageData.photosAmount > 0) {
    return ctx.scene.enter(config.scenes.home.abstracts.loadPhoto, { pageData })
  }
  const telegraphPage = await abstractService.createTelegraphPage(ctx.state.user, pageData)
  return ctx.finishAbstractLoading(telegraphPage)
})

scene.hears(config.btns.cancel, ctx => ctx.home('Как скажешь'))
scene.hears(ignoreCommand, ctx => ctx.reply('Мне нужен только файл :)'))

module.exports = scene
