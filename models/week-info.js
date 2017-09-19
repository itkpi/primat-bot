const mongoose = require('../modules/mongoose')

const Schema = mongoose.Schema,

    WeekInfo = new Schema({
      currWeek: Number,
      flag: Boolean  
    })

module.exports = mongoose.model('WeekInfo', WeekInfo)