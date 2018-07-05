const mongoose = require('../')

const { Schema } = mongoose
const Univer = new Schema({
  name: { type: String, required: true },
  currentSemester: { type: Number, required: true },
}, { strict: 'throw' })

module.exports = mongoose.model('Univer', Univer)
