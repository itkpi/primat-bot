const User = require('../../db/models/user')

const service = {
  create(data) {
    const user = new User(data)
    return user.save()
  },
  getByTgId(tgId) {
    return User.findOne({ tgId })
  },
  getByGroup(group) {
    return User.findOne({ group })
  },
  updateById(tgId, data) {
    return User.findOneAndUpdate({ tgId }, data)
  },
}

module.exports = service
