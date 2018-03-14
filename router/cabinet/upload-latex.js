const mathmode = require('mathmode')
const config = require('../../config')
const { picasa } = require('../../modules/utils')

module.exports = async (user, info) => {
  if (info.latexValues.length > 0) {
    const binaries = await Promise.all(
      info.latexValues.map(value => new Promise((resolve, reject) => {
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

    return uploadPhotos(user, Object.assign({}, info, { binaries }))
  }
}


function uploadPhotos(user, info) {
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
