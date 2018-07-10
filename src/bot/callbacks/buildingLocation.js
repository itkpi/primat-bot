const Building = require('../../db/models/building')
const { telegram } = require('../../modules/telegraf')

module.exports = async (ctx, query) => {
  const building = await Building.findOne({ name: query })
  if (building) {
    telegram.sendLocation(ctx.from.id, building.latitude, building.longitude)
    ctx.answerCbQuery('Прямо здесь!')
  } else {
    ctx.answerCbQuery('Ой, не нашел корпус :c', true)
  }
}
