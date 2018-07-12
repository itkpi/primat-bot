const config = require('config')
const Session = require('../../db/models/session')
const univerService = require('./univer')

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
  setByGroup(group, session) {
    session.groupId = group.groupId
    session.group = group.group
    session.course = group.course
    session.role = config.roles.student
  },
  async setByUser(user, session) {
    const semester = await univerService.getCurrSemester()
    session.user = user
    session.semester = semester
    config.sessionFields.forEach(field => {
      session[field] = user[field]
    })
  },
}

module.exports = service
