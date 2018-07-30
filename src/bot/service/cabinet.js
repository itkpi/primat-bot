const config = require('config')
const objectMapper = require('object-mapper')

const service = {
  whoAmI({ role, sessionGroup, userGroup, semester, course, userCourse }) { // eslint-disable-line
    switch (role) {
      case config.roles.student: {
        let msg = 'Ты студент этого прекрасного университета. '
          + `Учишься на ${userCourse} курсе, группа <b>${userGroup}</b>. `
        if (sessionGroup !== userGroup) {
          msg += `Но сейчас ты в гостах у <b>${sessionGroup}</b> (${course} курс).`
        }
        msg += `\nВыбран ${semester}-й семестр`
        return msg
      }
      case config.roles.abiturient: {
        const msg = 'Ты абитуриент этого прекрасного университета. '
          + `У тебя пока нет группы, но ты гостюешь у <b>${sessionGroup}</b> (${course} курс). `
          + `Выбран ${semester}-й семестр`
        return msg
      }
      case config.roles.noKPI: {
        const msg = 'Ты не студент этого университета, но сейчас ты в гостях у '
          + `<b>${sessionGroup}</b> (${course} курс). Выбран ${semester}-й семестр`
        return msg
      }
      case config.roles.teacher: {
        const msg = 'У тебя очень важная миссия - передать знания. Возможно, даже счастливчикам из группы '
          + `<b>${sessionGroup}</b>`
        return msg
      }
      default: {
        return 'Хз :c'
      }
    }
  },
  mapTelegraphInfo(info) {
    const map = {
      access_token: 'accessToken',
      author_name: 'authorName',
      author_url: 'authorUrl',
      short_name: 'shortName',
      page_count: 'pageCount',
    }
    return objectMapper(info, map)
  },
  getTelegraphInfoMsg(info) {
    const msg = `Short name: ${info.shortName}\nAuthor name: ${info.authorName}\n`
      + `Author url: ${info.authorUrl}\nPage count: ${info.pageCount}\n\nПояснения - http://telegra.ph/api#Account`
    return msg
  },
}

module.exports = service
