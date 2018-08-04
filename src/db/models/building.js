const mongoose = require('../')

const { Schema } = mongoose
const Building = new Schema({
  name: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
})

const Model = mongoose.model('Building', Building)
Model.ensureIndexes()

module.exports = Model
