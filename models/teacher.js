const mongoose = require('../modules/mongoose')
  
const Schema = mongoose.Schema,

  Teacher = new Schema({
    hub_id: { type: Number, required: true },
    last_name: { type: String, required: true },
    first_name: { type: String, required: true },
    middle_name: { type: String, required: true },
    name: { type: String, required: true },
    full_name: { type: String, required: true },
    short_name: { type: String, required: true },
    short_name_with_degree: { type: String, required: true },
    degree: { type: String },
    phone_number: { type: String, match: /^[0-9]{12}$/ }
  })

module.exports = mongoose.model('Teacher', Teacher)