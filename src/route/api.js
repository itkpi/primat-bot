const Router = require('koa-router')
const rozklad = require('node-rozklad-api')
const apiService = require('../service/api')

const api = new Router()

module.exports = router => {
  api.get('/timetable/:group', async ctx => {
    const timetable = await rozklad.timetable(ctx.params.group)
    return ctx.query.table
      ? apiService.transformForTable(timetable)
      : timetable
  })
  router.use('/api', api.routes(), api.allowedMethods())
}
