module.exports = (ctx, next) => {
  if (ctx.session && ctx.session.user) {
    const { username, tgId, group } = ctx.session.user,
          route = config.routes.reduce((res, route) => res || ctx.session[route] && route || null, null)

    const usrTxt = Object.values(config.btns).includes(ctx.message.text)
                      ? ctx.message.text.slice(3)
                      : ctx.message.text ? ctx.message.text : 'or uploaded smth'

    console.log(`${username || tgId}${group ? `, ${group}` : ''} has written ${usrTxt}` + 
      `${route ? ` [${route} |> ${ctx.session[route].nextCondition} -> ${usrTxt}]` : ''}`)
  }

  next()  
}