const { Markup } = require('telegraf'),
      WeekInfo = require('../models/week-info'),
      Schedule = require('../models/schedule'),
      { request } = require('../modules/utils')

module.exports = Router => {
  const router = Router('schedule', 
      ctx => ctx.message.text !== config.btns.schedule && !ctx.session.schedule,
      ctx => ctx.session.schedule && ctx.session.schedule.nextCondition || 'schedule')

  router.on('schedule', ctx => {
    const month = new Date().getMonth() + 1,
          currSemester = month > 7 && month <= 12 ? 1 : 2
    if (currSemester !== ctx.session.semester)
      return ctx.reply(`Расписание за ${ctx.session.semester}-й семестр тебе вряд ли кто-то скажет, можешь сменить его`)

    if (ctx.session.groupHubId) {
      ctx.session.schedule = { nextCondition: 'show' }
      ctx.reply('Давай посмотрим какие у тебя там пары', Markup
          .keyboard(['Сегодня', 'Завтра', 'Вчера', 'Эта неделя', 'Следующая неделя', 'Расписание пар', 'Отмена'],
              { columns: 2 })
          .resize().extra()
      )
      ctx.state.saveSession()
    } else {
      ctx.reply('Раписание твоей группы еще неизвестно. Попробуй зайти в свой кабинет, чтобы выбрать другую')
    }
  })

  router.on('show', async ctx => {
    if (ctx.state.btnVal === 'Отмена') {
      ctx.session.schedule = null
      ctx.state.saveSession()
      return ctx.reply('эх', ctx.state.homeMarkup)
    }
    try {
      const weekInfo = await WeekInfo.findOne({}),
            date = new Date,
            day = date.getDay(),
            week = weekInfo.currWeek

      /***************heroku costil*****************/
      if (day === 1 && weekInfo.flag) {
          weekInfo.currWeek = week === 1 ? 2 : 1
          weekInfo.flag = false
          weekInfo.save()
      } else if (day !== 1 && !weekInfo.flag) {
          weekInfo.flag = true
          weekInfo.save()
      }
      /*********************************************/

      if (ctx.state.btnVal === 'Расписание пар') {
        ctx.session.schedule = null
        ctx.state.saveSession()
        return ctx.replyWithHTML(getTimeSch(), ctx.state.homeMarkup)        
      }

      const query = getScheduleQuery(ctx, day, week),
            lessons = await getLessons(ctx, query)

      if (lessons)
        ctx.replyWithHTML(lessons, ctx.state.homeMarkup)
      else
        ctx.reply('По-видимому, в это время пар у тебя нет. Отдыхай!', ctx.state.homeMarkup)

      ctx.session.schedule = null
      ctx.state.saveSession()
    } catch(e) {
      ctx.state.error(e)
    }
  })

  return router.middleware()
}


function getTimeSch() {
    return `<b>1.</b> 8:30 - 10:05
<b>2.</b> 10:25 - 12:00
<b>3.</b> 12:20 - 13:55
<b>4.</b> 14:15 - 15:50
<b>5.</b> 16:10 - 17:45`
}

function getScheduleQuery(ctx, day, week) {
  const cases = {
    'Сегодня': `groups=${ctx.session.groupHubId}&day=${day}&week=${week}`,
    'Завтра': `groups=${ctx.session.groupHubId}&day=${(day + 1) % 8 ? (day + 1) % 8 : 1}&week=${week}`,
    'Вчера': `groups=${ctx.session.groupHubId}&day=${day - 1}&week=${week}`,
    'Эта неделя': `groups=${ctx.session.groupHubId}&week=${week}`,
    'Следующая неделя': `groups=${ctx.session.groupHubId}&week=${week === 1 ? 2 : 1}`
  }

  return cases[ctx.state.btnVal]
}

async function getLessons(ctx, query) {
  const sortCb = (a, b) => {
    if (a.day > b.day) return 1
    if (a.day < b.day) return -1
    if (a.number > b.number) return 1
    if (a.number < b.number) return -1    
  }
  const getDayName = num => ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Cуббота'][num - 1]

  const schedule = await Schedule.findOne({ groupHubId: ctx.session.groupHubId, query }),
        url = `${config.hub_lessons_url}?limit=100&`

  let lessons = schedule ? schedule.lessons : null

  // if it's not cached
  if (!lessons) {
    const response = await request(encodeURI(url + query)),
          body = response.body,
          data = JSON.parse(response.body).results.sort(sortCb),
          fields = ['day', 'week', 'rooms_full_names', 'teachers_short_names', 'type', 'number', 'discipline_name']
    lessons = data.map(lesson => {
      res = {}
      // 'type' is reserved word in mongoose Schema
      fields.forEach(field => res[`${field === 'type' ? 'lessonType' : field}`] = lesson[field])
      return res
    })
    const schedule = new Schedule({ lessons, query, groupHubId: ctx.session.groupHubId })
    schedule.save()
  }

  if (lessons.length > 0) {
    const types = ['лек', 'прак', 'лаб']
    let answer = `--<b>${getDayName(lessons[0].day)}</b>--\n`,
        day = lessons[0].day,
        fewDaysFlag = false

    lessons.forEach((lesson, indx) => {
        if (lesson.day !== day) {
            fewDaysFlag = true
            day = lesson.day
            answer += `\n--<b>${getDayName(day)}</b>--\n`
        }
        const place = lesson.rooms_full_names[0] || '',
              teacher = lesson.teachers_short_names[0] || '',
              type = types[lesson.lessonType]

        answer += `<b>${lesson.number}</b>. ${lesson.discipline_name}\n`
        if (!place && teacher)
            answer += `   ${teacher}`
        else if (!teacher && place)
            answer += `   ${place}`
        else if (place && teacher)
            answer += `   ${place}, ${teacher}`
        if (type) 
          answer += `  <i>${type}</i>`
        if (type || place || teacher)
          answer += '\n'
        else if (lessons[indx]) {
          lessons[indx].day !== day
          answer += '\n'
        } 
    })
    if (fewDaysFlag)
        answer = `${lessons[0].week}-я неделя\n` + answer

    return answer
  }
}
