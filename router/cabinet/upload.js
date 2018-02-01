const { createPage, parse } = require('../../modules/telegraph'),
      { request, picasa } = require('../../modules/utils')

module.exports = async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'upload')
    return

  if (!['text/html', 'text/plain'].includes(ctx.message.document.mime_type))
    return ctx.reply('Я понимаю только html лекции')

  try {
    const link = await ctx.telegram.getFileLink(ctx.message.document.file_id),
          response = await request(link),
          { page, photosAmount, lectureName, source } = parse(response.body)

    if (photosAmount > 0) {
      const picasaToken = await getAccessToken(picasa)

      ctx.session.cabinet = {
        page,
        source,
        lectureName,
        picasaToken,
        photosAmount,
        photoLinks: [],
        nextCondition: 'photo',
        subject: ctx.session.cabinet.subject
      }
      ctx.replyWithHTML(`Словил! Но, вижу, твоей лекции не хватает фотографий. ` +
        `Вот их количество, которое я от тебя жду, чтобы вклеить все на свои места: `+
        `<b>${photosAmount}</b>`)
    } else {
      const response = await createPage(ctx, lectureName, page, source)
      if (response) {
        ctx.reply(`Ты просто лучший! Только не забывай исправлять ошибки, вдруг что`)
        ctx.reply(response.url, ctx.state.homeMarkup)
      }
      ctx.session.cabinet = null
    }

  } catch(e) {
    return ctx.state.error(e)
  }

  ctx.state.saveSession()
}

function getAccessToken(picasa) {
  return new Promise((resolve, reject) => {
    const params = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }

    picasa.renewAccessToken(params, process.env.PICASA_REFRESH_TOKEN, 
      (err, token) => err ? reject(err) : resolve(token))
  })
}