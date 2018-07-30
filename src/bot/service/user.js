const config = require('config')
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
    return User.findOneAndUpdate({ tgId }, { $set: data }, { new: true })
  },
  upgradeAbiturientToStudent(tgId, groupData) {
    return this.updateById(tgId, Object.assign({}, groupData, { role: config.roles.student }))
  },
  setSetting(tgId, setting, value) {
    return this.updateById(tgId, { [`settings.${setting}`]: value })
  },
  filterSensitiveFields(user) {
    const copy = { ...user }
    config.userSensitiveFields.forEach(field => delete copy[field])
    return copy
  },
}

module.exports = service
