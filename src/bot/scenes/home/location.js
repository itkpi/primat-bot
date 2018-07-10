const config = require('config')
const Scene = require('telegraf/scenes/base')

const scene = new Scene(config.scenes.home.location)
// const btns = config.btns.home

module.exports = scene
