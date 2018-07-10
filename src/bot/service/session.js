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
    session.groupId = group.group_id || group.groupId
    session.group = group.group_full_name || group.groupFullName
  },
}

module.exports = service

const userService = require('./user')

module.exports.setByUser = async (tgId, session) => {
  const [user, semester] = await Promise.all([
    userService.getByTgId(tgId),
    univerService.getCurrSemester(),
  ])
  session.user = user
  session.semester = semester
  config.sessionFields.forEach(field => {
    session[field] = user[field]
  })
}
