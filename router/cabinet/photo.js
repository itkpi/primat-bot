const { createPage } = require('../../modules/telegraph'),
      { request, bot } = require('../../modules/utils')

module.exports = (ph, picasa) => async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'photo')
    return

  try {
    const tgLink = await bot.telegram.getFileLink(ctx.message.photo[2].file_id),
          link = await uploadPhoto(request, tgLink, picasa, ctx)

    ctx.session.cabinet.photoLinks.push(link)
    ctx.session.cabinet.photosAmount--

    const amount = ctx.session.cabinet.photosAmount
    if (amount === 0) {
      const { lectureName, page, photoLinks } = ctx.session.cabinet,
            response = await createPage(ph, ctx, lectureName, page, photoLinks)

      if (response) {
        ctx.reply(`Ты просто лучший! Только не забывай исправлять ошибки, вдруг что`)
        ctx.reply(response.url, ctx.state.homeMarkup)
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

async function uploadPhoto(request, url, picasa, ctx) {
  const response = await request({ encoding: null, url }),
        { course, username, tgId } = ctx.session.user,
        { subject, lectureName, picasaToken } = ctx.session.cabinet

        photoData = {
          title: `${course} course. ${subject} | ${new Date().toDateString()}`,
          summary: `${lectureName}. Created by ${username || tgId}.`,
          contentType: 'image/jpg',
          binary: response.body
        }

  return new Promise((resolve, reject) => picasa.postPhoto(picasaToken, config.album_id, photoData, 
      (err, { content }) => err ? reject(err) : resolve(content.src)))
}