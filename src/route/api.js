const rozklad = require('node-rozklad-api')
const service = require('../service/api')
const logger = require('../utils/logger')

module.exports = router => {
  router.use((ctx, next) => {
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    })
    return next()
  })
  router.use((ctx, next) => {
    logger.info(ctx.method, ctx.path)
    return next()
  })
  router.get('/timetable/group/:id', async ctx => {
    const { id } = ctx.params
    if (ctx.query.table) {
      const [group, timetable] = await Promise.all([rozklad.groups(id), rozklad.timetable(id)])
      const tableData = service.transformForTable(timetable)
      return ctx.body = Object.assign({}, { group }, tableData)
    }
    const timetable = await rozklad.timetable(id)
    return ctx.body = timetable
  })
  router.get('/timetable/teacher/:id', async ctx => {
    const { id } = ctx.params
    const [teacher, lessons] = await Promise.all([rozklad.teachers(id), rozklad.teacherLessons(id)])
    const timetable = ctx.query.table
      ? service.transformTeacherLessonsForTable(lessons)
      : service.transformTeacherLessons(lessons)
    ctx.body = Object.assign({}, timetable, { teacher })
  })
  router.use(router.allowedMethods())
}
