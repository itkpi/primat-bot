const { createPage, parse } = require('../../modules/telegraph'),
      { request, picasa } = require('../../modules/utils'),
      uploadLatex = require('./upload-latex')

module.exports = async ctx => {
  if (!ctx.session.cabinet || ctx.session.cabinet.nextCondition !== 'upload')
    return

  if (!['text/html', 'text/plain'].includes(ctx.message.document.mime_type))
    return ctx.reply('Я понимаю только html лекции')

  try {
    const link = await ctx.telegram.getFileLink(ctx.message.document.file_id),
          response = await request(link),
          { page, photosAmount, lectureName, latexValues } = parse(response.body)

    const picasaToken = (photosAmount > 0 || latexValues.length > 0)
      ? await getAccessToken()
      : null

    const pageData = {
      page,
      lectureName,
      picasaToken,
      photosAmount,
      latexValues,
      photoLinks: [],
      subject: ctx.session.cabinet.subject
    }

    if (photosAmount > 0) {
      ctx.session.cabinet = Object.assign({}, pageData, { nextCondition: 'photo' })

      ctx.replyWithHTML('Словил! Но, вижу, твоей лекции не хватает фотографий. ' +
        'Вот их количество, которое я от тебя жду, чтобы вклеить все на свои места: ' +
        `<b>${photosAmount}</b>`)
    } else {
      const latexPicasaLinks = await uploadLatex(ctx.session.user, pageData)
      const response = await createPage(ctx, lectureName, page, { latexPicasaLinks })

      ctx.reply('Ты просто лучший! Только не забывай исправлять ошибки, вдруг что')
      ctx.state.home(response.url)
    }

  } catch (e) {
    return ctx.state.error(e)
  }

  ctx.state.saveSession()
}


function getAccessToken() {
  return new Promise((resolve, reject) => {
    const params = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }

    picasa.renewAccessToken(params, process.env.PICASA_REFRESH_TOKEN,
      (err, token) => err ? reject(err) : resolve(token))
  })
}

// function uploadPhotos(user, info) {
//   const { course, username, tgId } = user,
//         { subject, lectureName, picasaToken, binaries } = info,

//         summary = `${lectureName}. Created by ${username || tgId}.`,
//         getTitle = num => `Formula #${num}. ${course} course. ${subject} | ${new Date().toDateString()}`,

//         upload = (binary, num) => new Promise((resolve, reject) =>
//           picasa.postPhoto(picasaToken, config.album_id, {
//               title: getTitle(++num),
//               contentType: 'image/jpg',
//               summary,
//               binary
//             }, (err, { content }) => err ? reject(err) : resolve(content.src)
//           ))

//   return Promise.all(binaries.map(upload))
// }
