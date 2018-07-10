const Session = require('../../db/models/session')

const getKey = tgId => `${tgId}:${tgId}`

const service = {
  getByTgId(id) {
    return Session.findOne({ key: getKey(id) })
  },
  updateByTgId(id, data) {
    return Session.findOneAndUpdate({ key: getKey(id) }, { 'data.user': data })
  },
  removeByTgId(id) {
    return Session.findOneAndRemove({ key: getKey(id) })
  },
}

module.exports = service
