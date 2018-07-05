const config = require('config')
const logger = require('../../../utils/logger')
const { telegram } = require('../../../modules/telegraf')
const User = require('./')

async function sendMsgToGroupmates({ group, tgId, firstName }) {
  const groupmates = await User.find({
    group,
    $or: [{ unsubscriber: { $exists: false } }, { unsubscriber: false }],
    tgId: { $ne: tgId },
  })
  const msg = `Твой одногруппник ${firstName} так же начал пользоваться мной.\n`
    + 'Вместе дела пойдут еще легче!'
  groupmates.forEach(({ tgId: id }) => telegram.sendMessage(id, msg))
}

module.exports = async data => {
  const {
    username,
    firstName,
    tgId,
    group,
    role,
  } = data
  const registryMsg = `New user ${username || firstName}|${role}${group ? ` from ${group}` : ''} has registered!`
  logger.info(registryMsg)
  telegram.sendMessage(config.ownerId, registryMsg)
  if (group && process.env.NODE_ENV === 'production') {
    await sendMsgToGroupmates({ group, tgId, firstName })
  }
}
