const mathmode = require('mathmode')
const { request, bot } = require('../modules/utils')
const util = require('util')
const fs = require('fs')
const unlink = util.promisify(fs.unlink)

module.exports = ctx => {
  const msg = ctx.message.text
    .split(' ')
    .slice(1)
    .map(str => str.trim())
    .join(' ')

  if (!msg)
    return ctx.reply('Выражение не указано. Попробуй еще раз')

  console.log(msg.length)

  const path = `${process.cwd()}/public/${ctx.from.id}:${ctx.message.date}.png`
  const dest = fs.createWriteStream(path)

  const render = mathmode(msg).pipe(dest)

  render.on('finish', async () => {
    try {
      await sendImg(ctx.from.id, path)
      await unlink(path)
    } catch (e) {
      ctx.state.error(e)
    }
  })
  render.on('error', e => {
    ctx.state.error(e)
  })
}

const sendImg = (chat_id, filePath) => {
  const method = 'POST'
  const url = `${bot.telegram.options.apiRoot}/bot${bot.telegram.token}/sendPhoto`
  const formData = { chat_id, photo: fs.createReadStream(filePath) }
  return request({ method, url, formData })
}
