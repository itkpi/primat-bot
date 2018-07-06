const mongoose = require('../')

const { Schema } = mongoose
const Session = new Schema({ }, { strict: false })

module.exports = mongoose.model('Session', Session)
