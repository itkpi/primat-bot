const parseSchedule = require('../../modules/parse-schedule')

module.exports = async ctx => {
  const { rGroupId, group } = ctx.session

  if (!rGroupId)
    return ctx.reply(
      'Чтобы знать своих преподаватлей, для начала нужно знать свою группу. Можешь выбрать ее в кабинете'
    )

  const lessonTeachers = await parseSchedule(rGroupId, 'teachers')
  const lessons = Object.keys(lessonTeachers)
  const answer = lessons
    .map((lesson, i) => `<b>${++i}. ${lesson}</b><code>:</code> ${lessonTeachers[lesson].join(', ')}`)
    .join('\n\n')

  return ctx.replyWithHTML(`<code>${group.toUpperCase()}</code>:\n${answer}`)
}
