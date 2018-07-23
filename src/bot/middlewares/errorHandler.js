const config = require('config')
const logger = require('../../utils/logger')
const { telegram } = require('../../modules/telegraf')

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    logger.error(e)
    ctx.reply('Ой, что-то пошло не так :c\nУже работаем над этим, попробуй позже')
    telegram.sendMessage(config.adminId, `${ctx.from.first_name}|Error: ${e.message}`)
  }
}
