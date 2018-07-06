const mongoose = require('../')

const { Schema } = mongoose
const Schedule = new Schema({
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
  }],
})

module.exports = mongoose.model('Schedule', Schedule)
