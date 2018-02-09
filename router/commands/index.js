const { commands: commandBtn } = config.home_btns

module.exports = ctx => {
  if (ctx.message.text !== commandBtn)
    return

  const { isTeacher, isAbitura } = ctx.session.user
  const { teacher: teacherCmds, abitura: abitCmds } = config.setme_command
  const commands = Object.assign({}, config.commands, isTeacher ? teacherCmds : isAbitura ? abitCmds : null)
  const names = Object.keys(commands)

  ctx.replyWithHTML(names.map(name => `${name} - ${commands[name]}`).join('\n'))
}