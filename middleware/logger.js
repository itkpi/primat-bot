const config = require('../config')

module.exports = (ctx, next) => {
  if (ctx.session && ctx.session.registry) {
    console.log(`[registry] ${ctx.from.username || ctx.from.id}: ${ctx.message.text}`)
  } else if (ctx.session && ctx.session.user && ctx.message) {
    const { username, tgId, group } = ctx.session.user,
          route = config.routes.find(route => ctx.session[route])

    const usrTxt = ctx.message.text ? ctx.message.text : 'or did smth'
    const roles = ['isStudent', 'isAbitura', 'isTeacher', 'notKPI']
    const role = roles.find(role => ctx.session.user[role])

    console.log(`${role}|${username || tgId}${group ? `, ${group}` : ''}: ${route ? '' : usrTxt}` +
      `${route ? `[${route} |> ${ctx.session[route].nextCondition || 'action'} -> ${usrTxt}]` : ''}`)
  }

  next()
}
