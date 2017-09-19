const { createPage } = require('../modules/telegraph')

module.exports = (bot, ph) => async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'photo')
    return

  try {
    const link = await bot.telegram.getFileLink(ctx.message.photo[2].file_id)
    ctx.session.cabinet.photoLinks.push(link)
    ctx.session.cabinet.photosAmount--

    const amount = ctx.session.cabinet.photosAmount
    if (amount === 0) {
      const { lectureName, page, photoLinks } = ctx.session.cabinet,
            response = await createPage(bot, ph, ctx, lectureName, page, photoLinks)

      if (response) {
        ctx.reply(`Ты просто лучший! Только не забывай исправлять ошибки, вдруг что`)
        ctx.reply(response.url, homeMarkup)
      }
      ctx.session.cabinet = null
    } else {
      ctx.replyWithHTML(`Оп, забрал. Еще не достает: <b>${amount}</b>`)
    }
  } catch(e) {
    return ctx.state.error(e)
  }
  ctx.state.saveSession()
}