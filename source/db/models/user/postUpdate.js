const sessionService = require('../../../bot/service/session')

module.exports = async function postUpdate() {
  const user = await this.findOne({})
  await sessionService.updateByTgId(user.tgId, user)
}
