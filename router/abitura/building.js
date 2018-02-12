const Building = require('../../models/building'),
  { telegram } = require('../../modules/utils').bot

module.exports = async ctx => {
  const { text } = ctx.message
  if (text === 'Назад')
    return ctx.state.home('Всегда рад помочь!')

  try {
    const building = await Building.findOne({ name: text })
    if (building) {
      telegram.sendLocation(ctx.from.id, building.latitude, building.longitude)
    } else {
      ctx.reply('Не нашел корпус :c')
    }
  } catch(e) {
    ctx.state.error(e)
  }
}