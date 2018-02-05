const Building = require('../../models/building'),
      { telegram } = require('../../modules/utils').bot

module.exports = async ctx => {
  const { username, id } = ctx.from
  console.log(`${username || id} got a location. Building: ${ctx.state.value}`)

  const building = await Building.findOne({ name: ctx.state.value })
  if (building) {
    telegram.sendLocation(id, building.latitude, building.longitude)
    ctx.answerCbQuery('Прямо здесь!')
  } else {
    ctx.answerCbQuery('Ой, нашел корпус :c', true)
  }
}