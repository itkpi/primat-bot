// const Teacher = require('../../models/teacher'),
const User = require('../../models/user'),
      start = require('../../commands/start'),
      currSem = require('../../modules/curr-sem'),
      { r } = require('../../modules/utils')

module.exports = async ctx => {
  try {
    const { text } = ctx.message
    if (text) {
      if (text === 'Назад') {
        return start(ctx)
      }

      const [last_name, first_name, middle_name] = text.split(' ')
      if (last_name && first_name && middle_name) {
        const teacherName = `${last_name} ${first_name} ${middle_name}`
        const teacher = await r.teacher(teacherName)
        if (teacher) {
          const teacherData = {
            teacherId: teacher.teacher_id,
            teacherName,
            teacherFullName: teacher.teacher_full_name,
            teacherShortName: teacher.teacher_short_name,
            teacherScheduleUrl: teacher.teacher_url,
            teacherRating: teacher.teacher_rating,
            isTeacher: true
          }
          const user = new User(Object.assign({}, ctx.session.registry, teacherData, { nextCondition: undefined }))
          user.save()
          ctx.session.teacherId = teacherData.teacherId
          ctx.session.teacherName = teacherName
          ctx.session.semester = currSem()
          ctx.session.user = user
          ctx.state.home('Добро пожаловать!')
        } else {
          return ctx.reply('Не нашел совпадений :c')
        }
      } else {
        if (!first_name) {
          return ctx.reply('Введите еще имя и отчество')
        } else if (!middle_name) {
          return ctx.reply('Введите еще отчество')
        }
      }
    }
  } catch (e) {
    ctx.state.error(e)
  }
}
