/* eslint-disable global-require */
const fs = require('fs')
const telegraf = require('../../modules/telegraf')

function cutExtension(file) {
  const dotIndx = file.indexOf('.')
  return dotIndx === -1 ? file : file.slice(0, dotIndx)
}

function set() {
  fs.readdirSync(__dirname).forEach(command => {
    if (command === 'index.js') {
      return false
    }
    return telegraf.command(cutExtension(command), require(`./${command}`)) // eslint-disable-line
  })
}

module.exports = { set }
