const { createPage, parse } = require('../../modules/telegraph'),
      { request, picasa, bot } = require('../../modules/utils'),
      config = require('../../config'),
      mathmode = require('mathmode')

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

    let latexPicasaLinks
    if (latexValues.length > 0) {
      const binaries = await Promise.all(
          latexValues.map((value, indx) => new Promise((resolve, reject) => {
            const render = mathmode(value)
            const bufs = []

            render.on('data', data => bufs.push(data))
            render.on('finish', () => {
              resolve(Buffer.concat(bufs))
            })
            render.on('error', e => {
              reject(e)
            })            
          }))
        )

      latexPicasaLinks = await sendPhotos(ctx.session.user, {
        page,
        binaries,
        lectureName,
        picasaToken,
        photosAmount,
        subject: ctx.session.cabinet.subject        
      })
    }

    if (photosAmount > 0) {
      ctx.session.cabinet = {
        page,
        lectureName,
        picasaToken,
        photosAmount,
        photoLinks: [],
        latexPicasaLinks,
        nextCondition: 'photo',
        subject: ctx.session.cabinet.subject
      }
      ctx.replyWithHTML('Словил! Но, вижу, твоей лекции не хватает фотографий. ' +
        'Вот их количество, которое я от тебя жду, чтобы вклеить все на свои места: ' +
        `<b>${photosAmount}</b>`)
    } else {
      const response = await createPage(ctx, lectureName, page, { latexPicasaLinks })
      if (response) {
        ctx.reply('Ты просто лучший! Только не забывай исправлять ошибки, вдруг что')
        ctx.state.home(response.url)
      }
      ctx.session.cabinet = null
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

function sendPhotos(user, info) {
  const { course, username, tgId } = user,
        { subject, lectureName, picasaToken, binaries } = info,

        summary = `${lectureName}. Created by ${username || tgId}.`,
        getTitle = num => `Formula #${num}. ${course} course. ${subject} | ${new Date().toDateString()}`,

        upload = (binary, num) => new Promise((resolve, reject) =>
          picasa.postPhoto(picasaToken, config.album_id, {
              title: getTitle(++num),
              contentType: 'image/jpg',
              summary,
              binary
            }, (err, { content }) => err ? reject(err) : resolve(content.src)
          ))

  return Promise.all(binaries.map(upload))
}
