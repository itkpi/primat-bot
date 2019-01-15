const config = require('config')
const Telegraf = require('telegraf')
const User = require('../../db/models/user')
const Building = require('../../db/models/building')
const telegraf = require('../../modules/telegraf')

module.exports = () => {
  telegraf.command(`/${config.commands.start}`, async ctx => {
    if (ctx.state.user) {
      return ctx.home('Хей, мы ведь уже знакомы')
    }
    return ctx.scene.enter(config.scenes.greeter.self)
  })

  telegraf.command(`/${config.commands.home}`, ctx => ctx.home())

  telegraf.command(`/${config.commands.b}`, async ctx => {
    const [, name] = ctx.message.text.split(' ')
    if (!name) {
      return ctx.reply('К команде добавь еще номер корпуса')
    }
    const buildingNumber = parseInt(name, 10)
    if (!Number.isInteger(buildingNumber)) {
      return ctx.reply('Это не похоже на номер, попробуй еще раз')
    }
    const building = await Building.findOne({ name: buildingNumber })
    return building
      ? ctx.replyWithLocation(building.latitude, building.longitude)
      : ctx.reply('Корпуса с таким номер нет :c')
  })

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
