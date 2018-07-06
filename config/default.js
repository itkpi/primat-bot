const { stdTimeFunctions } = require('pino')
const btns = require('./buttons')
const registryLinks = require('./registerLinks')
const commands = require('./commands')
const scenes = require('./scenes')

function getRegistryMessage() {
  const msg = 'Вот и все, теперь ты с нами. Не отказывай себе ни в чем\n\n'
  const links = Object.keys(registryLinks)
  const info = links.map(link => `<a href="${link}">Здесь</a> ${registryLinks[link]}`).join('\n')
  return msg + info
}

module.exports = {
  port: process.env.PORT || 3000,
  appUrl: process.env.APP_URL,
  db: {
    url: process.env.MONGO_URL || 'mongodb://localhost/primat-bot',
  },
  botToken: process.env.BOT_TOKEN,
  logger: {
    timestamp: stdTimeFunctions.slowTime,
    prettyPrint: true,
    level: process.env.LOG_LEVEL || 'info',
  },
  btns,
  scenes,
  roles: {
    abiturient: 'abiturient',
    student: 'student',
    noKPI: 'nokpi',
  },
  ownerId: 147615474,
  registryMessage: getRegistryMessage(),
  sessionFilter: ['date', '__v'],
  commands,
  homeMessages: ['Домооой', 'Ладненько', 'Как скажешь', 'Эх', 'Приехали'],
}
