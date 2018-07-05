const fs = require('fs')
const Stage = require('telegraf/stage')

function getScenes(path) {
  return fs.readdirSync(path).reduce((scenes, file) => {
    if (file === 'index.js') {
      return scenes
    }
    const filePath = `${path}/${file}`
    const module = require(filePath) // eslint-disable-line
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      scenes.push(...getScenes(filePath))
    }
    return scenes.concat(module)
  }, [])
}

const stage = new Stage(getScenes(__dirname))

module.exports = stage
