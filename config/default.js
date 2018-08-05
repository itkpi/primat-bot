const { stdTimeFunctions } = require('pino')
const btns = require('./btns')
const infoLinks = require('./infoLinks')
const commands = require('./commands')
const scenes = require('./scenes')
const settings = require('./settings')

const adminId = 147615474

module.exports = {
  port: process.env.PORT || 3200,
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
  githubHookPath: process.env.GITHUB_HOOK_PATH || '/secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  picasaRefreshToken: process.env.PICASA_REFRESH_TOKEN,
  textPhotosNumPostfix: process.env.TEXT_PHOTOS_NUM_POSTFIX || '_|_neveroyatna_|_',
  btns,
  scenes,
  roles: {
    abiturient: 'abiturient',
    student: 'student',
    noKPI: 'nokpi',
    teacher: 'teacher',
    bachelor: 'bachelor',
    master: 'master',
  },
  adminId,
  infoLinks,
  commands,
  homeMessages: ['Домооой', 'Ладненько', 'Как скажешь', 'Эх', 'Приехали'],
  universityName: 'KPI',
  lessonsSchedule: '<b>1.</b> 8:30 - 10:05\n'
    + '<b>2.</b> 10:25 - 12:00\n'
    + '<b>3.</b> 12:20 - 13:55\n'
    + '<b>4.</b> 14:15 - 15:50\n'
    + '<b>5.</b> 16:10 - 17:45\n',
  sessionFields: ['groupId', 'group', 'role', 'course', 'flow'],
  seeBuildingLocationMsg: 'Посмотреть местоположение корпуса №',
  removeMarkup: { reply_markup: { remove_keyboard: true } },
  settings,
  picasaAlbumId: '6581909187263057105',
  picasaLatexAlbumId: '6586243140246025649',
  userSensitiveFields: ['telegraph'],
  inlineCacheTime: 60 * 60 * 24 * 20000, // 20 000 days
  whiteList: [adminId, 250646651],
}
