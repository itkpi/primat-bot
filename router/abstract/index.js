const Abstract = require('../../models/abstract'),
      { Markup } = require('telegraf'),

      subject = require('./subject'),
      num = require('./num'),
      uploadPdf = require('./upload-pdf'),

      { bot, Router } = require('../../modules/utils')

const router = Router(
  'abstract',
  ctx => ctx.message.text !== config.btns.abstracts && !ctx.session.abstract,
  ctx => (ctx.session.abstract && ctx.session.abstract.nextCondition) || 'abstract'
)

router.on('abstract', async ctx => {
  try {
    const subjects = await Abstract.distinct('subject', {
      course: ctx.session.course,
      flow: ctx.session.flow,
      semester: ctx.session.semester
    })

    if (subjects.length > 0) {
      ctx.session.abstract = { nextCondition: 'subject' }
      ctx.reply(
        'Какой предмет',
        Markup.keyboard(subjects.concat('Отмена'), {
          columns: subjects.length / 2
        }).resize().extra()
      )
    } else {
      ctx.session.abstract = null
      ctx.reply(
        'По твоему году и семестру совсем нет никаких лекций :c',
        ctx.state.homeMarkup
      )
    }

    ctx.state.saveSession()
  } catch (e) {
    return ctx.state.error(e)
  }
})

router.on('subject', subject)
router.on('num', num)

bot.on('callback_query', uploadPdf)

module.exports = router.middleware()