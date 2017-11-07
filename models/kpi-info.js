const mongoose = require('../modules/mongoose')

const kpiInfo = new Schema({
        name: { type: String, unique: true },
        flows: [{ type: String }]
      })

module.exports = mongoose.model('kpiInfo', kpiInfo)