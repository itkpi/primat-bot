const config = require('config')
const handleBuildingLocation = require('../callbacks/buildingLocation')

module.exports = ctx => {
  const query = ctx.callbackQuery.data
  switch (ctx.callbackQuery.message.text) {
    case config.seeBuildingLocationMsg: {
      return handleBuildingLocation(ctx, query)
    }
    default: {
      return ctx.answerCbQuery('?')
    }
  }
}
