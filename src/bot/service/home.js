const config = require('config')
const { Markup } = require('telegraf')
const scheduleService = require('./schedule')

const btns = config.btns.home

const service = {
  timeleft() {
    const len = 60 + 35 // 1:35
    const shift = 60 + 55 // 1:55
    const firstStart = 60 * 8 + 30 // 8:30

    const date = new Date()
    const month = date.getMonth() + 1
    const UTCshift = month > 3 && month < 11 ? 3 : 2

    const timeNow = new Date(date.getTime() + UTCshift * 60 * 60 * 1000)
    const hours = timeNow.getUTCHours()
    const minutes = timeNow.getUTCMinutes()
    const curr = 60 * hours + minutes

    for (let i = 0; i < 5; i += 1) {
      const start = firstStart + shift * i
      const end = start + len
      if (curr > start && curr < end) {
        const m = end - curr
        let ending
        if (m % 10 === 1) {
          ending = m === 11 ? 'минуточек' : 'минуточка'
        } else if (m % 10 < 5 && m % 10 !== 0) {
          ending = m > 10 && m < 15 ? 'минуточек' : 'минуточки'
        } else {
          ending = 'минуточек'
        }
        return `Тебе осталось ${m} ${ending}`
      }
    }
    return 'Сейчас не время пар - отдыхай!'
  },
  async teachers(groupId, group) {
    const lessonTeachers = await scheduleService.parseSchedule(groupId, 'teachers')
    const lessons = Object.keys(lessonTeachers)
    const text = lessons
      .map((lesson, i) => `<b>${i + 1}. ${lesson}</b><code>:</code> ${lessonTeachers[lesson].join(', ')}`)
      .join('\n\n')
    return `<code>${group.toUpperCase()}</code>:\n${text}`
  },
  getKeyboard(role, nativeRole) {
    switch (role) {
      case config.roles.student: {
        const btnValues = Object.values(btns.student)
        if (nativeRole === config.roles.abiturient) {
          btnValues.push(btns.other.returnRole)
        }
        return Markup.keyboard(btnValues, { columns: 2 }).resize().extra()
      }
      case config.roles.abiturient: {
        return Markup.keyboard(Object.values(btns.abiturient), { columns: 2 }).resize().extra()
      }
      case config.roles.noKPI: {
        return Markup.keyboard(Object.values(btns.noKPI), { columns: 2 }).resize().extra()
      }
      default: {
        return false
      }
    }
  },
}

module.exports = service
