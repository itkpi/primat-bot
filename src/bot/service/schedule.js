const config = require('config')
const rozklad = require('node-rozklad-api')

const btns = config.btns.schedule

const formatTime = time => time.split(':')
  .slice(0, 2)
  .join(':')

const addBuildings = (lessonRoom, currBuildings) => lessonRoom.split(',').reduce((acc, room) => {
  const building = room.split('-')[1]
  return acc.includes(building) ? acc : acc.concat(building)
}, currBuildings.slice())

function parseLessons(lessons, currDay, currWeek) {
  return lessons.reduce((acc, lesson) => {
    const {
      lesson_room: lessonRoom,
      lesson_type: lessonType,
      time_start: timeStart,
      lesson_number: lessonNumber,
      lesson_name: lessonName,
      day_name: dayName,
      lesson_week: lessonWeek,
      day_number: dayNumber,
    } = lesson
    if (Number(lessonWeek) !== acc.prevLesson.lessonWeek) {
      acc.text += `\n<b>${lessonWeek}-й тиждень</b>\n`
    }
    if (Number(dayNumber) !== acc.prevLesson.dayNumber) {
      if (currWeek === Number(lessonWeek) && currDay === Number(dayNumber)) {
        acc.text += `<b>Сьогодні: ${dayName}</b>\n`
        acc.boldDay = true
      } else {
        acc.text += `<pre>${dayName}</pre>\n`
        acc.boldDay = false
      }
    }
    if (acc.boldDay) {
      acc.text += '<b>#|</b>'
    }
    acc.text += `<b>${lessonNumber}</b>. ${formatTime(timeStart)}<code>|</code> ${lessonName} `
    if (lessonNumber) {
      acc.text += `<code>${lessonRoom}</code>`
      acc.buildings = addBuildings(lessonRoom, acc.buildings)
    }
    if (lessonType) {
      acc.text += ` <i>${lessonType}</i>`
    }
    acc.text += '\n'
    acc.prevLesson = { dayNumber: Number(dayNumber), lessonWeek: Number(lessonWeek) }
    return acc
  }, {
    text: '',
    prevLesson: {},
    buildings: [],
  })
}

const service = {
  async getLessons(id, param, ops) {
    if (!Object.values(btns).includes(param)) {
      return null
    }
    const currDay = (new Date()).getDay()
    const nextDay = (currDay + 1) % 8 ? (currDay + 1) % 8 : 1
    const currWeek = await rozklad.currWeek()
    const nextWeek = currWeek === 1 ? 2 : 1
    const cases = {
      [btns.today]: {
        day_number: currDay,
        lesson_week: currWeek,
      },
      [btns.tomorrow]: {
        day_number: nextDay,
        lesson_week: nextDay === 1 ? nextWeek : currWeek,
      },
      [btns.yesterday]: {
        day_number: currDay - 1,
        lesson_week: currWeek,
      },
      [btns.thisWeek]: { lesson_week: currWeek },
      [btns.nextWeek]: { lesson_week: nextWeek },
      [btns.whole]: {},
    }
    const lessons = await rozklad.lessons(id, cases[param])
    if (!lessons) {
      return null
    }
    return ops.parse ? parseLessons(lessons, currDay, currWeek) : lessons
  },
  time: config.lessonsSchedule,
}

module.exports = service
