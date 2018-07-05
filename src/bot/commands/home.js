const config = require('config')

module.exports = async ctx => {
  const msg = 'Домооой'
  ctx.scene.enter(config.scenes.home.self, { msg })
}
