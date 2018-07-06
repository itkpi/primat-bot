const config = require('config')
const mongoose = require('../db')
const telegraf = require('../modules/telegraf')
const middlewares = require('./middlewares')
const commands = require('./commands')
const logger = require('../utils/logger')

const session = new middlewares.Session(mongoose.connections[0])

module.exports = {
  setMiddlewares() {
    telegraf.use(middlewares.errorHandler)
    telegraf.use(session.middleware)
    telegraf.use(middlewares.auth)
    telegraf.use(middlewares.logger)
    telegraf.use(middlewares.scenes)
  },
  async start() {
    await session.setup()
    this.setMiddlewares()
    commands.set()
    telegraf.catch(e => {
      logger.error(e)
      telegraf.telegram.sendMessage(config.ownerId, `Error: ${e.message}`)
    })
  },
}
