const config = require('config')

const service = {
  whoAmI(role, sessionGroup, userGroup, semester) {
    switch (role) {
      case config.roles.student: {
        let msg = `Ты студент этого прекрасного университета. Твоя группа ${userGroup}.`
        if (sessionGroup !== userGroup) {
          msg += `Но сейчас ты в гостах у ${sessionGroup}`
        }
        msg += `\nВыбран ${semester}-й семестр`
        return msg
      }
      case config.roles.abiturient: {
        const msg = 'Ты абитуриент этого прекрасного университета. '
          + `У тебя пока нет группы, но ты гостюешь у ${sessionGroup}, ${semester}-й семестр`
        return msg
      }
      default: {
        return 'Хз :c'
      }
    }
  },
}

module.exports = service
