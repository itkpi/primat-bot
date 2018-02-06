const Building = require('../models/building'),
      { bot } = require('../modules/utils')

module.exports = async ctx => {
  try {
    const num = ctx.message.text.split(' ')[1]
    if (!num)
      return ctx.reply('Укажи номер через пробел - /building 15')

    const building = await Building.findOne({ name: num })
    if (!building)
      return ctx.reply('Неизвестный мне номер :c')

    bot.telegram.sendLocation(ctx.from.id, building.latitude, building.longitude)
  } catch(e) {
    ctx.state.error(e)
  }
}