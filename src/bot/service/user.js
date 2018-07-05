const User = require('../../db/models/user')

const service = {
  createUser(data) {
    const user = new User(data)
    return user.save()
  },
  updateById(tgId, data) {
    return User.findOneAndUpdate({ tgId }, data)
  },
}

module.exports = service
