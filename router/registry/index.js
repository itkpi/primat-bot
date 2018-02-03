const group = require('./group'),
      course = require('./course'),

      { Router } = require('../../modules/utils')

const router = Router('registry', ctx => !ctx.session.registry, ctx => ctx.session.registry.nextCondition)

router.on('group', group)
router.on('course', course)

module.exports = router.middleware()
