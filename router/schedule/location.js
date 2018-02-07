const Building = require('../../models/building'),
      { telegram } = require('../../modules/utils').bot

module.exports = async ctx => {
  const { username, id } = ctx.from
  console.log(`${username || id} got a location. Building: ${ctx.state.value}`)

  try {
    const building = await Building.findOne({ name: ctx.state.value })
    if (building) {
      telegram.sendLocation(id, building.latitude, building.longitude)
      ctx.answerCbQuery('Прямо здесь!')
    } else {
      ctx.answerCbQuery('Ой, не нашел корпус :c', true)
    }
  } catch(e) {
    console.error(e)
    ctx.answerCbQuery('Ой, ошибочка :c', true)
  }
}