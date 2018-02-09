const { r } = require('../../modules/utils'),
      parseSchedule = require('../../modules/parse-schedule'),
      { teachers: teachersBtn } = config.home_btns

module.exports = async ctx => {
  if (ctx.message.text !== teachersBtn)
      return

  const { rGroupId, group } = ctx.session

  if (!rGroupId)
    return ctx.reply(
      'Чтобы знать своих преподаватлей, для начала нужно знать свою группу. Можешь выбрать ее в кабинете'
    )

  const lessonTeachers = await parseSchedule(rGroupId, 'teachers')
  const lessons = Object.keys(lessonTeachers)
  const answer = lessons.map(lesson => `<b>${lesson}</b><code>:</code> ${lessonTeachers[lesson].join(', ')}`).join('\n\n')

  return ctx.replyWithHTML(`<code>${group.toUpperCase()}</code>:\n${answer}`)
}
