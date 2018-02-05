const schedule = require('./schedule'),
      location = require('./location'),
      show = require('./show'),

      { Router, bot } = require('../../modules/utils')

const router = Router('schedule', 
    ctx => ctx.message.text !== config.btns.schedule && !ctx.session.schedule,
    ctx => ctx.session.schedule && ctx.session.schedule.nextCondition || 'schedule')

router.on('schedule', schedule)
router.on('show', show)

bot.on('callback_query', location)

module.exports = router.middleware()
