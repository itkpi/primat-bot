const { createPage } = require('../../modules/telegraph'),
      { request } = require('../../modules/utils'),
      util = require('util')

module.exports = (ph, picasa) => async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'photo')
    return

  try {
    const tgLink = await ctx.telegram.getFileLink(ctx.message.photo[2].file_id),
          amount = --ctx.session.cabinet.photosAmount

    ctx.session.cabinet.photoLinks.push(tgLink)

    if (amount === 0) {
      const { lectureName, page } = ctx.session.cabinet,
            msgInfo = await ctx.reply('Секундочку, делаю всю магию...'),
            picasaLinks = await uploadPhotos(picasa, ctx),
            response = await createPage(ctx, lectureName, page, picasaLinks)

        ctx.telegram.deleteMessage(msgInfo.chat.id, msgInfo.message_id)
        ctx.reply(`Ты просто лучший! Только не забывай исправлять ошибки, вдруг что`)
        ctx.reply(response.url, ctx.state.homeMarkup)
        ctx.session.cabinet = null
    } else {
      ctx.replyWithHTML(`Оп, забрал. Еще не достает: <b>${amount}</b>`)
    }
  } catch(e) {
    return ctx.state.error(e)
  }
  ctx.state.saveSession()
}

async function uploadPhotos(picasa, ctx) {
  const { course, username, tgId } = ctx.session.user,
        { subject, lectureName, picasaToken, photoLinks: tgLinks } = ctx.session.cabinet,

        summary = `${lectureName}. Created by ${username || tgId}.`,
        getTitle = num => `Photo #${num}. ${course} course. ${subject} | ${new Date().toDateString()}`,

        download = url => request({ encoding: null, url }),

        upload = num => ({ body }) => new Promise((resolve, reject) =>
          picasa.postPhoto(picasaToken, config.album_id, {
              title: getTitle(++num),
              summary,
              contentType: 'image/jpg',
              binary: body
            }, (err, { content }) => err ? reject(err) : resolve(content.src)
        ))

        dwnldBinariesUpldPhotos = urls => Promise.all(urls.map((url, num) => 
          download(url).then(upload(num))
        ))

  return dwnldBinariesUpldPhotos(tgLinks)
}