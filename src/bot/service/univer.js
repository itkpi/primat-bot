const Univer = require('../../db/models/univer')

const service = {
  async getCurrSemester() {
    const univerInfo = await Univer.findOne({ name: 'KPI' })
    return univerInfo.currentSemester
  },
}

module.exports = service
