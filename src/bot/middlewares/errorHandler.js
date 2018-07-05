const config = require('config')
const logger = require('../../utils/logger')
const { telegram } = require('../../modules/telegraf')

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    logger.error(e)
    ctx.reply('Ой, что-то пошло не так :c')
    telegram.sendMessage(config.ownerId, `${ctx.from.first_name}|Error: ${e.message}`)
  }
}
