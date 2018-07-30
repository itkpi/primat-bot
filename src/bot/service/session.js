const config = require('config')
const Session = require('../../db/models/session')
const univerService = require('./univer')

const getKey = tgId => `${tgId}:${tgId}`

const service = {
  getByTgId(id) {
    return Session.findOne({ key: getKey(id) })
  },
  updateByTgId(id, data) {
    const update = {
      $set: { data },
      $setOnInsert: { key: getKey(id) },
    }
    return Session.findOneAndUpdate({ key: getKey(id) }, update, { upsert: true })
  },
  removeByTgId(id) {
    return Session.findOneAndRemove({ key: getKey(id) })
  },
  setByGroup(group, session) {
    session.groupId = group.groupId
    session.group = group.group
    session.course = group.course
    session.role = config.roles.student
  },
  async setByUser(user, session) {
    const data = { semester: await univerService.getCurrSemester() }
    config.sessionFields.forEach(field => {
      data[field] = user[field]
    })
    if (!session) {
      return this.updateByTgId(user.tgId, data)
    }
    return Object.assign(session, data)
  },
}

module.exports = service
