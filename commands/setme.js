const currSem = require('../modules/curr-sem')

module.exports = ctx => {
  if (ctx.session.user && (ctx.session.user.isTeacher || ctx.session.user.isAbitura)) {
    ctx.session = Object.assign({}, ctx.session, {
      semester: currSem(),
      rGroupId: null,
      course: null,
      group: null,
      flow: null
    })

    ctx.state.home('А вот и ты')
  }
}
