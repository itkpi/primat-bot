const config = require('config')
const fs = require('fs')
const telegraf = require('../../modules/telegraf')

function cutExtension(file) {
  const dotIndx = file.indexOf('.')
  return dotIndx === -1 ? file : file.slice(0, dotIndx)
}

function protectAdminCommand(ctx, next) {
  return config.commandWhiteList.includes(ctx.from.id)
    ? next()
    : Promise.resolve()
}

function protectChatCommand(ctx, next) {
  return ctx.session.isChat ? next() : Promise.resolve()
}

function protectFromChat(ctx, next) {
  return ctx.session.isChat ? Promise.resolve() : next()
}

function set() {
  fs.readdirSync(__dirname).forEach(command => {
    if (command === 'index.js') {
      return false
    }
    const commandName = cutExtension(command)
    const module = require(`./${command}`) // eslint-disable-line
    const parts = commandName.split('-')
    const prefix = parts[0]
    if (prefix === 'admin') {
      return telegraf.command('/' + parts[1], protectAdminCommand, module)
    }
    if (prefix === 'chat') {
      return telegraf.command('/' + parts[1], protectChatCommand, module)
    }
    return telegraf.command('/' + commandName, protectFromChat, module)
  })
}

module.exports = { set }
