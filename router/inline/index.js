const os = require('os')
const mathmode = require('../../modules/mathmode')

const [ipv4] = os.networkInterfaces().eth0 || [{}]
const { address } = ipv4

module.exports = async ctx => {
  console.log(ctx.inlineQuery)
  console.log(ctx.chosenInlineResult)

  if (!address)
    return ctx.answerInlineQuery([])

  const msg = ctx.inlineQuery.query
    .split(' ')
    .map(str => str.trim())
    .join(' ')

  if (!msg)
    return ctx.answerInlineQuery([])

  try {
    const path = `${process.cwd()}/public/${msg.slice(0, 10)}${Date.now()}.jpg`
    const route = path.slice(path.indexOf('/public'))
    const render = mathmode(msg, path)

    render.on('finish', () => {
      const obj = {
        type: 'photo',
        id: 1,
        title: 'kek',
        description: 'description',
        caption: 'caption',
        photo_url: `${address}${route}`,
        thumb_url: `${address}${route}`
      }
      console.log(obj)
      ctx.answerInlineQuery([obj])
    })
    render.on('error', console.error)

    // await unlink(path)
  } catch (e) {
    console.error(e)
    return ctx.answerInlineQuery([])
  }
}
