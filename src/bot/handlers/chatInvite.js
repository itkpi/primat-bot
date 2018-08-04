const objectMapper = require('object-mapper')
const config = require('config')
const Chat = require('../../db/models/chat')
const msgFromDataToUserData = require('../utils/msgFromDataToUserData')

function mapChat(chatData) {
  const map = {
    id: 'tgId',
    title: 'title',
    type: 'type',
    all_members_are_administrators: 'allMembersAreAdministrators',
  }
  return objectMapper(chatData, map)
}

module.exports = ctx => {
  if (ctx.message.new_chat_members.find(member => member.id === config.botId)) {
    const { chat: chatData, from } = ctx.message
    const chat = new Chat(Object.assign(
      {},
      mapChat(chatData),
      { inviter: msgFromDataToUserData(from) },
    ))
    chat.save()
    return ctx.reply('Ухх, всем дарова. Че делать будем?')
  }
  return Promise.resolve()
}
