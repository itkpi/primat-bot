const Router = require('koa-router')
const rozklad = require('node-rozklad-api')

const api = new Router()

module.exports = router => {
  api.get('/timetable/:group', async ctx => rozklad.timetable(ctx.params.group))
  // api.get('/timetable')
  router.use('/api', api.routes(), api.allowedMethods())
}
