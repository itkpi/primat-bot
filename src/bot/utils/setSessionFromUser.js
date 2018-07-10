const config = require('config')
const univerService = require('../service/univer')
const userService = require('../service/user')

module.exports = async (tgId, session) => {
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
