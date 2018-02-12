const currSem = require('../../modules/curr-sem'),
  { r } = require('../../modules/utils'),
  { Markup } = require('telegraf')

module.exports = async ctx => {
  if (!ctx.session.group && !ctx.session.user.isTeacher)
    return ctx.reply('Для начала выбери группу в кабинете')

  if (currSem() !== ctx.session.semester)
    return ctx.reply(`Расписание за ${ctx.session.semester}-й семестр тебе вряд ли кто-то скажет, можешь сменить его`)

  if (ctx.session.user.isTeacher && !ctx.session.rGroupId) {
    const lessons = await r.teacherLessons(ctx.session.user.teacherId)
    if (!lessons)
      ctx.reply('Ваше расписание отсутсвует :c')
    else
      ctx.replyWithHTML(parseTeacherLessons(lessons))
    return
  }

  ctx.session.schedule = { nextCondition: 'show' }
  ctx.reply('Давай посмотрим какие у тебя там пары',
    Markup.keyboard([
      'Сегодня', 'Завтра', 'Вчера', 'Эта неделя', 'Следующая неделя', 'Расписание пар', 'Назад'
    ], { columns: 2 })
      .resize()
      .extra()
  )
  ctx.state.saveSession()
}

function parseTeacherLessons(lessons) {
  const weeks = ['1-й тиждень', '2-й тиждень']

  const res = lessons.reduce((acc, lesson) => {
    const week = weeks[lesson.lesson_week - 1]
    if (!acc.week || acc.week !== week) {
      acc.answer += `\n<b>${week}</b>\n`
      acc.week = week
    }

    const day = lesson.day_name
    if (!acc.day || acc.day !== day) {
      acc.answer += `<pre>${day}</pre>\n`
      acc.day = day
    }

    acc.answer += `<b>${lesson.lesson_number}.</b> ${lesson.lesson_name} ${lesson.lesson_room} <i>${lesson.lesson_type}</i>\n`
    return acc
  }, { week: null, day: null, answer: '' })

  return res.answer
}