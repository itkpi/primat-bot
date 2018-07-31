const KoaRouter = require('koa-router')
const rozklad = require('node-rozklad-api')
const service = require('../service/api')

const api = new KoaRouter()

module.exports = router => {
  api.get('/timetable/group/:id', async ctx => {
    const { id } = ctx.params
    if (ctx.query.table) {
      const [group, timetable] = await Promise.all([rozklad.groups(id), rozklad.timetable(id)])
      const tableData = service.transformForTable(timetable)
      return ctx.body = Object.assign({}, { group }, tableData)
    }
    const timetable = await rozklad.timetable(id)
    return ctx.body = timetable
  })
  api.get('/timetable/teacher/:id', async ctx => {
    const { id } = ctx.params
    const [teacher, lessons] = await Promise.all([rozklad.teachers(id), rozklad.teacherLessons(id)])
    const timetable = ctx.query.table
      ? service.transformTeacherLessonsForTable(lessons)
      : service.transformTeacherLessons(lessons)
    ctx.body = Object.assign({}, timetable, { teacher })
  })
  router.use('/api', api.routes(), api.allowedMethods())
}
