const config = require('config')
const Chat = require('../../db/models/chat')

module.exports = ctx => {
  if (ctx.message.left_chat_member.id === config.botId) {
    return Chat.findOneAndRemove({ tgId: ctx.message.chat.id })
  }
  return Promise.resolve()
}
