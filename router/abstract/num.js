const Abstract = require('../../models/abstract'),
      { Extra } = require('telegraf')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Отмена')
    return ctx.state.home('nu lan')

  try {
    const skip = ctx.state.btnVal === 'Все' ? 0 : ctx.state.btnVal - 1,
          limit = ctx.state.btnVal === 'Все' ? 0 : 1,
          abstracts = await Abstract.find({
              subject: ctx.session.abstract.subject,
              course: ctx.session.course,
              flow: ctx.session.flow,
              semester: ctx.session.semester
            }, { telegraph_url: 1 })
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit)

    if (abstracts.length !== 0) {
      const getAbstractMarkup = id =>
        Extra.markup(m => m.inlineKeyboard([m.callbackButton('Загрузить в pdf', `download|${id}`)]))

      let chain = Promise.resolve()
      for (let i = 0; i < abstracts.length; i++) {
        const abstract = abstracts[i]
        chain = chain.then(
          () => ctx.reply(abstract.telegraph_url, getAbstractMarkup(abstract._id))
        )
      }
    } else
      return ctx.reply('Лекции под таким номером нет')

    ctx.state.home('Держи, бро. Надеюсь, это тебе поможет не вылететь')
  } catch (e) {
    return ctx.state.error(e)
  }
}