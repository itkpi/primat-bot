module.exports = ctx => {
  if (ctx.state.btnVal === 'Домой')
    return ctx.state.home('В другой раз')

  console.log('change-group')
}