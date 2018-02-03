const schedule = require('./schedule'),
      show = require('./show'),

      { Router } = require('../../modules/utils')

const router = Router('schedule', 
    ctx => ctx.message.text !== config.btns.schedule && !ctx.session.schedule,
    ctx => ctx.session.schedule && ctx.session.schedule.nextCondition || 'schedule')

router.on('schedule', schedule)
router.on('show', show)

module.exports = router.middleware()
