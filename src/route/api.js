const Router = require('koa-router')

const api = new Router()

module.exports = router => {
  // api.get('/', ctx => {
  //   ctx.body =
  // })
  // api.get('/timetable')
  router.use('/api', api.routes(), api.allowedMethods())
}
