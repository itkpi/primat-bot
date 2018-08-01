const config = require('config')
const fs = require('fs')
const telegraf = require('../../modules/telegraf')

function cutExtension(file) {
  const dotIndx = file.indexOf('.')
  return dotIndx === -1 ? file : file.slice(0, dotIndx)
}

function protectAdminCommand(ctx, next) {
  if (ctx.from.id !== config.adminId) {
    return Promise.resolve()
  }
  return next()
}

function set() {
  fs.readdirSync(__dirname).forEach(command => {
    if (command === 'index.js') {
      return false
    }
    const commandName = cutExtension(command).toLowerCase()
    const module = require(`./${command}`) // eslint-disable-line
    if (commandName.substring(0, 5) === 'admin') {
      return telegraf.command('/' + commandName.slice(5), protectAdminCommand, module)
    }
    return telegraf.command('/' + commandName, module)
  })
}

module.exports = { set }
