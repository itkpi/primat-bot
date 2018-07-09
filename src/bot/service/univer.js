const config = require('config')
const Univer = require('../../db/models/univer')

const service = {
  async getCurrSemester() {
    const univerInfo = await Univer.findOne({ name: config.universityName })
    return univerInfo.currentSemester
  },
}

module.exports = service
