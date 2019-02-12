const config = require('config')
const rozklad = require('node-rozklad-api')
const { Extra } = require('telegraf')

const btns = config.btns.schedule

const formatTime = time => time.split(':')
  .slice(0, 2)
  .join(':')

const addBuildings = (lessonRoom, currBuildings = []) => lessonRoom.split(',').reduce((acc, room) => {
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
        acc.text += `#|<b>Сьогодні: ${dayName}</b>\n`
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
    if (lessonRoom) {
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
    let currWeek = await rozklad.currWeek()
    // REMOVE SOON!!!!
    console.log('getLessons -> currWeek from api', currWeek)
    currWeek = currWeek === 1 ? 2 : 1
    console.log('TCL: getLessons -> currWeek converted', currWeek)
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
  async teacherLessons(id) {
    const lessons = await rozklad.teacherLessons(id)
    if (!lessons) {
      return { text: 'Не нашел никаких пар :c', buildings: [] }
    }
    const currDay = (new Date()).getDay()
    const currWeek = await rozklad.currWeek()
    return lessons.reduce((acc, lesson) => {
      const {
        lesson_week: lessonWeek,
        day_name: dayName,
        day_number: dayNumber,
        lesson_number: lessonNumber,
        time_start: timeStart,
        lesson_name: lessonName,
        lesson_room: lessonRoom,
        lesson_type: lessonType,
        groups,
      } = lesson
      if (lessonWeek !== acc.prevWeek) {
        acc.text += `\n<b>${lessonWeek}-й тиждень</b>\n`
      }
      if (dayName !== acc.prevDay) {
        if (Number(lessonWeek) === currWeek && Number(dayNumber) === currDay) {
          acc.text += `#|<b>Сьогодні: ${dayName}</b>\n`
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
      if (lessonRoom) {
        acc.text += `<code>${lessonRoom}</code>`
        acc.buildings = addBuildings(lessonRoom, acc.buildings)
      }
      if (lessonType) {
        acc.text += ` <i>${lessonType}</i>`
      }
      if (groups && groups.length > 0) {
        acc.text += ' <b>[</b>'
        acc.text += groups.map(group => group.group_full_name.toUpperCase()).join(', ')
        acc.text += '<b>]</b>'
      }
      acc.text += '\n'
      acc.prevWeek = lessonWeek
      acc.prevDay = dayName
      return acc
    }, { text: '' })
  },
  async parseSchedule(groupId, requiredValue) {
    const timetable = await rozklad.timetable(groupId)
    if (!timetable) {
      return null
    }
    const weeks = [1, 2]
    const days = [1, 2, 3, 4, 5, 6]
    const lessonNums = [0, 1, 2, 3, 4]
    const result = {
      subjects: [],
      teachers: {},
    }
    weeks.forEach(week => days.forEach(dayNum => {
      const day = timetable.weeks[week].days[dayNum]
      if (!day) {
        return
      }
      lessonNums.forEach(num => {
        const {
          teachers,
          lesson_name: subject,
          lesson_full_name: lessonFullName,
        } = day.lessons[num] || {}
        if (teachers && lessonFullName && teachers.length > 0) {
          if (!result.teachers[lessonFullName]) {
            result.teachers[lessonFullName] = []
          }
          const teacher = teachers[0].teacher_full_name || teachers[0].teacher_name
          if (!result.teachers[lessonFullName].includes(teacher)) {
            result.teachers[lessonFullName].push(teacher)
          }
        }
        if (subject && !result.subjects.includes(subject)) {
          result.subjects.push(subject)
        }
      })
    }))
    return result[requiredValue]
  },
  getBuildingsLocationMarkup(buildings) {
    return Extra.markup(m => m.inlineKeyboard(buildings.map(num => m.callbackButton(num, num))))
  },
  time: config.lessonsSchedule,
}

module.exports = service
