const currSem = require('../modules/curr-sem')

module.exports = ctx => {
  ctx.session.rGroupId = null
  ctx.session.semester = currSem()
  ctx.session.course = null
  ctx.session.group = null
  ctx.session.flow = null
  ctx.state.saveSession()
}