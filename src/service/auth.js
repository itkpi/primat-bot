const sessionService = require('../bot/service/session')
const User = require('../db/models/user')
const { telegram } = require('../modules/telegraf')
const getRegMsg = require('../utils/getRegMsg')

module.exports = {
  async register(userData) {
    userData.registeredWithSite = true
    const user = new User(userData)
    await user.save()
    await sessionService.setByUser(user)
    telegram.sendMessage(user.tgId, getRegMsg(user.role))
    return user
  },
}
