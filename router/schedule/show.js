const { r } = require('../../modules/utils')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Отмена')
    return ctx.state.home('эх')

  if (ctx.state.btnVal === 'Расписание пар') {
    return ctx.state.homeWithHTML(getTimeSch())        
  }

  try {
    const lessons = await getLessons(ctx.session.rGroupId, ctx.state.btnVal)
    return lessons
      ? ctx.state.homeWithHTML(lessons)
      : ctx.state.home('По-видимому, в это время пар у тебя нет. Отдыхай!')
  } catch(e) {
    ctx.state.error(e)
  }
}

function getTimeSch() {
    return `<b>1.</b> 8:30 - 10:05
<b>2.</b> 10:25 - 12:00
<b>3.</b> 12:20 - 13:55
<b>4.</b> 14:15 - 15:50
<b>5.</b> 16:10 - 17:45`
}

async function getLessons(id, value) {
  const currDay = (new Date).getDay(),
        nextDay = (currDay + 1) % 8 ? (currDay + 1) % 8 : 1,
        currWeek = await r.currWeek(),
        nextWeek = currWeek === 1 ? 2 : 1

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

  const lessons = cases[value]
    ? await r.lessons(id, cases[value])
    : null
  return lessons && parseLessons(lessons)
}

function parseLessons(lessons) {
  return lessons.reduce((acc, lesson) => {
    if (!acc.day || lesson.day_name !== acc.day) {
      if (acc.day && acc.putWeek) {
        acc.putWeek = false
        acc.answer = `<b>${lesson.lesson_week}-й тиждень</b>` + acc.answer
      }
      acc.answer += `\n<pre>${lesson.day_name}</pre>\n`
      acc.day = lesson.day_name
    }

    acc.answer += `<b>${lesson.lesson_number}</b>| ${lesson.lesson_name}\n`

    const { lesson_room, teacher_name, lesson_type } = lesson

    let secondLine = ''
    if (lesson_room)
      secondLine += `<b>${lesson_room}</b>`

    if (teacher_name)
      secondLine += `${lesson_room ? ', ' : ''}${teacher_name}`

    if (lesson_type)
      secondLine += `  <i>${lesson_type}</i>`

    secondLine = `     ${secondLine}`

    acc.answer += `${secondLine}\n`
    return acc
  }, { day: null, answer: '', putWeek: true }).answer
}