const Building = require('../../models/building'),
      { telegram } = require('../../modules/utils').bot

module.exports = async ctx => {
  const { data } = ctx.callbackQuery
  if (!data) return

  const [command, value] = data.split('|')
  if (command !== 'location')
    return

  const { username, id } = ctx.from
  console.log(`${username || id} got a location. Building: ${value}`)

  const building = await Building.findOne({ name: value })
  if (building) {
    telegram.sendLocation(id, building.latitude, building.longitude)
    ctx.answerCbQuery('Прямо здесь!')
  } else {
    ctx.answerCbQuery('Ой, нашел корпус :c', true)
  }
}