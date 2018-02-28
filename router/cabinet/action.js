const { Markup } = require('telegraf'),
  config = require('../../config'),
  parseSchedule = require('../../modules/parse-schedule'),
  { cabinet_btns: btns } = config

const groupSubjects = {}

module.exports = async ctx => {

  switch (ctx.state.btnVal) {

  case btns.change_group:
    ctx.reply('К кому пойдем?', Markup
      .keyboard(['Домой'])
      .resize().oneTime().extra()
    )
    ctx.session.cabinet.nextCondition = 'changeGroup'
    break

  case config.load_lecture_btn:
    if (ctx.session.user.telegraph_user) {
      if (!ctx.session.user.telegraph_token)
        return ctx.reply('У тебя пока нет аккаунта\nТебе поможет команда /telegraph')
      try {
        const subjects = groupSubjects[ctx.session.user.group] || await parseSchedule(ctx.session.user.rGroupId, 'subjects')
        groupSubjects[ctx.session.user.group] = subjects

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

  case btns.change_semester:
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

  case btns.who_am_i: {
    let answer = ''
    if (ctx.session.user.group)
      answer += `Твоя родина - <b>${ctx.session.user.group.toUpperCase()}.</b> `
    else if (ctx.session.user.isTeacher) {
      answer += `Вы серьезный преподаватель с рейтингом ${ctx.session.user.teacherRating}. `
    } else if (ctx.session.user.isAbitura) {
      answer += 'Ты абитуриент с большими перспективами. '
    } else {
      answer += 'Ты не с КПИ. '
    }
    if (ctx.session.user.group !== ctx.session.group && 
        ctx.session.group && ctx.session.semester) {
      answer += `Но сейчас ты в гостях у <b>${ctx.session.group.toUpperCase()}</b> ` +
          `в ${ctx.session.semester}-ом семестре.`
    } else if (ctx.session.semester) {
      answer += ` Сейчас ты в ${ctx.session.semester}-ом семестре. `+
          'Может, хочешь зайти к кому-то в гости?'
    } else {
      answer += ' Если хочешь, выбери себе группу для визита'
    }

    ctx.replyWithHTML(answer)
    break
  }
  case btns.back:
    ctx.state.home('Ну ладно')
    break
  default:
    ctx.reply('Выбери что-то')
  }

  ctx.state.saveSession()
}
