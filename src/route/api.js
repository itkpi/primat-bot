const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const rozklad = require('node-rozklad-api')
const mongoose = require('mongoose')
const service = require('../service/api')
const errors = require('../errors')

const api = new KoaRouter()

module.exports = router => {
  api.get('/timetable/group/:id', async ctx => {
    const { id } = ctx.params
    if (ctx.query.table) {
      const [group, timetable] = await Promise.all([rozklad.groups(id), rozklad.timetable(id)])
      if (!timetable) {
        return errors.notFound('There is no any schedule for this group')
      }
      const tableData = service.transformForTable(timetable)
      return ctx.body = Object.assign({}, { group }, tableData)
    }
    const timetable = await rozklad.timetable(id)
    if (!timetable) {
      return errors.notFound('There is no any schedule for this group')
    }
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
  api.get('/abstracts/info', async ctx => {
    ctx.body = await service.getAbstractsInfo()
  })
  api.get('/abstracts/:id?', async ctx => {
    const { id } = ctx.params
    if (!id) {
      const { flow, course, semester } = ctx.query
      if (!(semester && flow && course)) {
        return errors.badRequest('Semester, flow and course are required query params')
      }
      return ctx.body = await service.getAbstracts(ctx.query)
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errors.badRequest('Invalid id')
    }
    const abstract = await service.getAbstractById(id)
    return abstract
      ? ctx.body = abstract
      : errors.notFound('Abstract with such id doesn\'t exist')
  })
  router.use('/api', cors(), api.routes(), api.allowedMethods())
}
