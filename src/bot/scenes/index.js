const fs = require('fs')
const Stage = require('telegraf/stage')

function getScenes(path) {
  return fs.readdirSync(path).reduce((scenes, file) => {
    if (file === 'index.js') {
      return scenes
    }
    const filePath = `${path}/${file}`
    if (fs.statSync(filePath).isDirectory()) {
      scenes.push(...getScenes(filePath))
    }
    return scenes.concat(require(filePath)) // eslint-disable-line
  }, [])
}

const stage = new Stage(getScenes(__dirname))

module.exports = stage
