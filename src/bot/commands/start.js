const config = require('config')

module.exports = async ctx => {
  if (ctx.session.user) {
    return ctx.reply('Хей, мы ведь уже знакомы')
  }
  return ctx.scene.enter(config.scenes.greeter.self)
}
