const group = require('./group'),
      course = require('./course')

module.exports = Router => {
  const router = Router('registry', ctx => !ctx.session.registry, ctx => ctx.session.registry.nextCondition)

  router.on('group', group)
  router.on('course', course)

  return router.middleware()
}
