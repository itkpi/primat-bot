const userService = require('../bot/service/user')
const User = require('../db/models/user')

module.exports = {
  async register(userData) {
    userData.registeredWithSite = true
    const user = new User(userData)
    await user.save()
    await userService.finishRegistry(user)
    return user
  },
}
