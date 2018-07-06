const config = require('config')
const mongoose = require('mongoose')
const logger = require('../utils/logger')

const { url } = config.db
const db = mongoose.connection

mongoose.Promise = Promise

mongoose.connect(url, { useMongoClient: true })

db.on('error', e => logger.error(e))
db.once('open', () => logger.info('Connected to the mongoDB'))
db.once('close', () => logger.info('MongoDB connection has closed'))

module.exports = mongoose
