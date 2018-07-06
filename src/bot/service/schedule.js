const rozklad = require('node-rozklad-api')

const service = {
  async getLessons() {
    const currDay = (new Date()).getDay()
    const nextDay = (currDay + 1) % 8 ? (currDay + 1) % 8 : 1
    const currWeek = await rozklad.currWeek()
    const nextWeek = currWeek === 1 ? 2 : 1

    const cases = {
      'Сегодня': {
        day_number: currDay,
        lesson_week: currWeek
      },
      'Завтра': {
        day_number: nextDay,
        lesson_week: nextDay === 1 ? nextWeek : currWeek
      },
      'Вчера': {
        day_number: currDay - 1,
        lesson_week: currWeek
      },
      'Эта неделя': { lesson_week: currWeek },
      'Следующая неделя': { lesson_week: nextWeek }
    }
  },
  time: '<b>1.</b> 8:30 - 10:05\n'
      + '<b>2.</b> 10:25 - 12:00\n'
      + '<b>3.</b> 12:20 - 13:55\n'
      + '<b>4.</b> 14:15 - 15:50\n'
      + '<b>5.</b> 16:10 - 17:45\n',
}

module.exports = service
