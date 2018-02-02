const { r } = require('../../modules/utils')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Отмена')
    return ctx.state.home('эх')

  if (ctx.state.btnVal === 'Расписание пар') {
    ctx.session.schedule = null
    ctx.state.saveSession()
    return ctx.replyWithHTML(getTimeSch(), ctx.state.homeMarkup)        
  }

  try {
    const lessons = await getLessons(ctx.session.rGroupId, ctx.state.btnVal)

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

  const res = await r.lessons(id, cases[value])
  console.log(res)
}