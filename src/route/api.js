const Router = require('koa-router')
const rozklad = require('node-rozklad-api')
const apiService = require('../service/api')

const api = new Router()

module.exports = router => {
  api.use((ctx, next) => {
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    })
    return next()
  })
  api.get('/timetable/:group', async ctx => {
    const timetable = await rozklad.timetable(ctx.params.group)
    ctx.body = ctx.query.table
      ? apiService.transformForTable(timetable)
      : timetable
  })
  api.get('/teacher-lessons/:id', async ctx => {
    ctx.body = await rozklad.teacherLessons(ctx.params.id)
  })
  router.use('/api', api.routes(), api.allowedMethods())
}
