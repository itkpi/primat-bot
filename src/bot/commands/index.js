const config = require('config')
const Telegraf = require('telegraf')
const User = require('../../db/models/user')
const telegraf = require('../../modules/telegraf')

module.exports = () => {
  telegraf.command(`/${config.commands.start}`, async ctx => {
    if (ctx.state.user) {
      return ctx.home('Хей, мы ведь уже знакомы')
    }
    return ctx.scene.enter(config.scenes.greeter.self)
  })

  telegraf.command(`/${config.commands.home}`, ctx => ctx.home())

  telegraf.command(`/${config.commands.selfremove}`, Telegraf.acl(config.whiteList), async ctx => {
    ctx.session = {}
    await User.deleteOne({ tgId: ctx.from.id })
    return ctx.reply('session and user removed')
  })

  telegraf.command(`/${config.commands.sessionremove}`, Telegraf.acl(config.whiteList), async ctx => {
    ctx.session = {}
    return ctx.reply('session removed')
  })
}
