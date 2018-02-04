const { Markup } = require('telegraf'),
      { r } = require('../../modules/utils')

module.exports = async ctx => {
  switch (ctx.state.btnVal) {
    case 'Поменять группу':
      ctx.reply('К кому пойдем?', Markup
          .keyboard(['Домой'])
          .resize().oneTime().extra()
      )
      ctx.session.cabinet.nextCondition = 'changeGroup'
      break
    case 'Загрузить лекцию': {
      if (ctx.session.user.telegraph_user) {
        if (!ctx.session.user.telegraph_token)
          return ctx.reply('У тебя пока нет аккаунта\nТебе поможет команда /telegraph')
        try {
          const subjects = ctx.session.subjects || await getSubjects(ctx.session.user.rGroupId)
          ctx.session.subjects = subjects

          const amount = subjects.length
          if (amount > 0) {
            ctx.reply('По какому предмету?',
                Markup.keyboard(subjects.concat('Отмена'), { columns: 3 })
                  .resize().extra()
            )
            ctx.session.cabinet.subjects = subjects
            ctx.session.cabinet.nextCondition = 'subject'
          } else {
            ctx.reply('Твои предметы мне почему-то неизвестны.')
          }
        } catch(e) {
          ctx.state.error(e)
        }

      } else ctx.reply('Нет доступа')
      break
    }
    case 'Сменить семестр':
      if (ctx.session.semester) {
        const currSemester = ctx.session.semester,
              newSemester = (currSemester + 1) % 3

        ctx.session.semester = newSemester ? newSemester : 1
        ctx.reply(`Ты благополучно покинул ${currSemester}-й семестр, `+ 
          `сменив его на ${ctx.session.semester}-й`)
      } else {
        ctx.reply('Нет, так дело не пйдет. Попробуй другую группу')
      }
      break
    case 'Кто я?':
      let answer = ''
      if (ctx.session.user.group)
        answer += `Твоя родина - <b>${ctx.session.user.group.toUpperCase()}.</b> `
      else {
        answer += 'Ты не с КПИ. '
      }
      if (ctx.session.user.group !== ctx.session.group && 
        ctx.session.group && ctx.session.semester) {
        answer += `Но сейчас ты в гостях у <b>${ctx.session.group.toUpperCase()}</b> ` +
          `в ${ctx.session.semester}-ом семестре.`
      } else if (ctx.session.semester) {
        answer += ` Сейчас ты в ${ctx.session.semester}-ом семестре. `+
          `Может, хочешь зайти к кому-то в гости?`
      } else {
        answer += ' Если хочешь, выбери себе группу для визита'
      }

      ctx.replyWithHTML(answer)
      break
    case 'Телефоны':
      ctx.session.cabinet.nextCondition = 'teacher'
      ctx.reply(
        'Введи фамилию преподаватеоя (на украинском), номер которого ты хочешь узнать',
        Markup.keyboard(['Домой']).resize().extra()
      )
      break
    case 'Назад':
      ctx.state.home('Ну ладно')
      break
    default:
      ctx.reply('Выбери что-то')
  }

  ctx.state.saveSession()
}

async function getSubjects(groupId) {
    const timetable = await r.lessons(groupId),
        weeks = [1, 2],
        days = [1, 2, 3, 4, 5, 6],
        nums = [0, 1, 2, 3, 4],
        subjects = []

  weeks.forEach(week => days.forEach(dayNum => {
    const day = timetable.weeks[week].days[dayNum]
    if (day) {
      nums.forEach(i => {
        const lesson = day.lessons[i]
        if (lesson) {
          const subject = lesson.lesson_name
          if (!subjects.includes(subject))
            subjects.push(subject)
        }
      })
    }
  }))

  return subjects
}