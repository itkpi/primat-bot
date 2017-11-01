const picasa = new require('picasa'),
      { createPage } = require('../modules/telegraph')

async function uploadPhoto(request, url, ctx) {
  const response = await request({ encoding: null, url }),
        { course, username, tgId } = ctx.session.user,
        photoData = {
          title: `${course} course. ${ctx.session.cabinet.subject} | ${new Date().toDateString()}`,
          summary: `Created by ${username || tgId}. ${ctx.session.cabinet.lectureName}`,
          contentType: 'image/jpg',
          binary: response.body
        }
  console.log('UPLOAD PHOTO')
  // picasa.postPhoto(accessToken)
  return response
}

module.exports = (bot, ph, request) => async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'photo')
    return

  try {
    const tgLink = await bot.telegram.getFileLink(ctx.message.photo[2].file_id)
          // link = await uploadPhoto(request, tgLink, ctx)

    ctx.session.cabinet.photoLinks.push(tgLink)
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