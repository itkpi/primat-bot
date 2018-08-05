const config = require('config')
const mathmode = require('mathmode')
const sizeOf = require('image-size')
const picasa = require('../../modules/picasa')
const getPicasaAccessToken = require('../utils/getPicasaAccessToken')

module.exports = async ctx => {
  const expression = ctx.inlineQuery.query.trim()
  if (!expression) {
    return
  }
  const render = mathmode(expression, { format: 'jpg' })
  const bufs = []
  render.on('data', data => {
    bufs.push(data)
  })
  render.on('end', async () => {
    const binary = Buffer.concat(bufs)
    const token = await getPicasaAccessToken()
    const data = {
      contentType: 'image/jpg',
      title: ctx.inlineQuery.id,
      binary,
    }
    const photoSizes = sizeOf(binary)
    const result = await picasa.postPhoto(token, config.picasaLatexAlbumId, data)
    const answer = [{
      type: 'photo',
      id: result.id,
      photo_url: result.content.src,
      thumb_url: result.content.src,
      photo_width: photoSizes.width,
      photo_height: photoSizes.height,
    }]
    return ctx.answerInlineQuery(answer, { cache_time: config.inlineCacheTime })
  })
  render.on('error', () => ctx.answerInlineQuery({ input_message_content: 'Incorrect formula :c' }))
}
