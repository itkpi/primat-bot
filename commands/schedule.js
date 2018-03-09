const { r } = require('../modules/utils')

const formatTime = time => time.split(':')
  .slice(0, 2)
  .join(':')

module.exports = async ctx => {
  try {
    const group = ctx.message.text.split(' ')[1]
    if (!group)
      return ctx.reply('Чтобы посмотреть расписание, укажи группу')

    const schedule = await r.timetable(group)
    if (!schedule)
      return ctx.reply('Не могу найти расписания по этой группе, попробуй другую')

    const weeks = [1, 2]
    const days = [1, 2, 3, 4, 5, 6]

    const currWeek = await r.currWeek()
    const currDay = (new Date).getDay()

    let answer = ''
    weeks.forEach(weekNum => {
      answer += `<b>${weekNum}-й тиждень</b>\n`
      const week = schedule.weeks[weekNum]
      days.forEach(dayNum => {
        const day = week.days[dayNum]
        if (day.lessons.length > 0) {
          answer += currWeek === weekNum && currDay === dayNum
            ? `<b>__${day.day_name}__</b>\n`
            : `<pre>${day.day_name}</pre>\n`

          day.lessons.forEach(lesson => {
            const { lesson_room, lesson_type, time_start } = lesson
            answer += `<b>${lesson.lesson_number}</b>. ${formatTime(time_start)}<code>|</code> ${lesson.lesson_name} `

            if (lesson_room)
              answer += `<code>${lesson_room}</code>`

            if (lesson_type)
              answer += ` ${lesson_type}`

            answer += '\n'
          })
        }
      })
      answer += '\n'
    })

    return ctx.replyWithHTML(answer)
  } catch (e) {
    ctx.state.error(e)
  }
}
