const fs = require('fs')

module.exports = router => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') {
      return
    }
    const module = require(`./${file}`) // eslint-disable-line
    module(router)
  })
  return router.routes()
}
