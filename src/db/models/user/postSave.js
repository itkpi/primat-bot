const config = require('config')
const logger = require('../../../utils/logger')
const extractUsername = require('../../../utils/extractUsername')
const { telegram } = require('../../../modules/telegraf')
const mongoose = require('../../')

async function sendMsgToGroupmates({ group, tgId, username }) {
  const groupmates = await mongoose.models.User.find({
    group,
    tgId: { $ne: tgId },
  })
  const msg = `Твой одногруппник ${username} так же начал пользоваться мной.\n`
    + 'Вместе дела пойдут еще легче!'
  groupmates.forEach(({ tgId: id }) => telegram.sendMessage(id, msg))
}

module.exports = async data => {
  const {
    tgId,
    group,
    role,
  } = data
  const username = extractUsername(data)
  const registryMsg = `New user ${username}|${role}${group ? ` from ${group}` : ''} has registered!`
  logger.info(registryMsg)
  telegram.sendMessage(config.adminId, registryMsg)
  if (group) {
    sendMsgToGroupmates({ group, tgId, username })
  }
}
