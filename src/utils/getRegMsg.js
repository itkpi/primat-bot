const convertLinksToMessage = require('../bot/utils/convertLinksToMessage')

module.exports = role => 'Вот и все, теперь ты с нами. Не отказывай себе ни в чем\n\n' + convertLinksToMessage(role)
