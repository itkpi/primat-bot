const config = require('config')

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
      default: {
        return 'Хз :c'
      }
    }
  },
}

module.exports = service
