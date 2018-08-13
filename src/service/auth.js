const { createHash, createHmac } = require('crypto')
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
  checkSignature(token, { hash, ...data }) {
    const secret = createHash('sha256')
      .update(token)
      .digest()
    const checkString = Object.keys(data)
      .sort()
      .map(k => `${k}=${data[k]}`)
      .join('\n')
    const hmac = createHmac('sha256', secret)
      .update(checkString)
      .digest('hex')
    return hmac === hash
  },
}
