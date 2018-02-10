const mongoose = require('../modules/mongoose')

const Schema = mongoose.Schema,

  Schedule = new Schema({
    groupHubId: { type: String, required: true },
    query: { type: String, required: true },
    lessons: [{
      day: Number,
      week: Number,
      lessonType: Number,
      number: Number,
      discipline_name: String,
      rooms_full_names: [String],
      teachers_short_names: [String],
    }]
  })

module.exports = mongoose.model('Schedule', Schedule)