const config = require('config')
const User = require('../../db/models/user')
const Chat = require('../../db/models/chat')

const service = {
  create(data) {
    const user = new User(data)
    return user.save()
  },
  get(tgId) {
    return User.findOne({ tgId })
  },
  getByGroup(group) {
    return User.findOne({ group })
  },
  update(tgId, data) {
    return User.findOneAndUpdate({ tgId }, { $set: data }, { new: true })
  },
  upgradeAbiturientToStudent(tgId, groupData) {
    return this.update(tgId, Object.assign({}, groupData, { role: config.roles.student }))
  },
  setSetting(tgId, setting, value) {
    return this.update(tgId, { [`settings.${setting}`]: value })
  },
  filterSensitiveFields(user) {
    const copy = Object.assign({}, user)
    config.userSensitiveFields.forEach(field => delete copy[field])
    return copy
  },
  getChat(tgId) {
    return Chat.findOne({ tgId })
  },
}

module.exports = service
