const mongoose = require('../modules/mongoose')

const Schema = mongoose.Schema,

      Building = new Schema({
        name: { type: Number, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      })

module.exports = mongoose.model('Building', Building)
