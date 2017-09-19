const mongoose = require('mongoose'),
  // url = config.mongo_url,
  url = process.env.MONGO_URL,
  db = mongoose.connection

  mongoose.Promise = Promise

mongoose.connect(url, { useMongoClient: true })

db.on('error', err => console.log(err))
db.once('open', () => console.log('Connected to the mongoDB'))
db.once('close', () => console.log('Connection has closed'))

module.exports = mongoose