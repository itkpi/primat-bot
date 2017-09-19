const { createPage, parse } = require('../modules/telegraph')

module.exports = (bot, homeMarkup, request, ph) => async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'upload')
    return

  if (!['text/html', 'text/plain'].includes(ctx.message.document.mime_type))
  // if (!['text/html'].includes(ctx.message.document.mime_type))
    return ctx.reply('Я понимаю только html лекции')

  try {
    const link = await bot.telegram.getFileLink(ctx.message.document.file_id),
          response = await request(link),
          { page, photosAmount, lectureName } = parse(response.body)

    if (photosAmount > 0) {
      ctx.session.cabinet = {
        page,
        lectureName,
        photosAmount,
        photoLinks: [],
        nextCondition: 'photo',
        subject: ctx.session.cabinet.subject
      }
      ctx.replyWithHTML(`Словил! Но, вижу, твоей лекции не хватает фотографий. ` +
        `Вот их количество, которое я от тебя жду, чтобы вклеить все на свои места: `+
        `<b>${photosAmount}</b>`)
    } else {
      const response = await createPage(bot, ph, ctx, lectureName, page)
      if (response) {
        console.log('page created')
        console.log(response)
        ctx.reply(`Ты просто лучший! Только не забывай исправлять ошибки, вдруг что`)
        ctx.reply(response.url, homeMarkup)
      }
      ctx.session.cabinet = null
    }

  } catch(e) {
    return ctx.state.error(e)
  }

  ctx.state.saveSession()
}