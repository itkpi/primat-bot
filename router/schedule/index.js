const schedule = require('./schedule'),
      location = require('./location'),
      show = require('./show'),

      { Router, callbackBtn, bot } = require('../../modules/utils')

const router = Router('schedule', 
    ctx => ctx.message.text !== config.home_btns.schedule && !ctx.session.schedule,
    ctx => ctx.session.schedule && ctx.session.schedule.nextCondition || 'schedule')

router.on('schedule', schedule)
router.on('show', show)

callbackBtn.on('location', location)

module.exports = router.middleware()
