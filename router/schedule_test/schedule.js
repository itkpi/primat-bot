const currSem = require('../../modules/curr-sem'),
      { r } = require('../../modules/utils'),
      { Markup } = require('telegraf')

module.exports = async ctx => {
  if (!ctx.session.group)
    return ctx.reply('Для начала выбери группу')

  if (currSem() !== ctx.session.semester)
    return ctx.reply(`Расписание за ${ctx.session.semester}-й семестр тебе вряд ли кто-то скажет, можешь сменить его`)

  ctx.session.schedule = { nextCondition: 'show' }
  ctx.reply('Давай посмотрим какие у тебя там пары',
      Markup.keyboard([
          'Сегодня', 'Завтра', 'Вчера', 'Эта неделя', 'Следующая неделя', 'Расписание пар', 'Отмена'
        ], { columns: 2 })
      .resize()
      .extra()
  )
  ctx.state.saveSession()
}