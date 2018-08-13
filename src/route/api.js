const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const rozklad = require('node-rozklad-api')
const Abstract = require('../db/models/abstract')
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
  api.get('/abstracts/info', async ctx => {
    const $group = {
      _id: '$flow',
      result: { $addToSet: { course: '$course', semester: '$semester' } },
    }
    const $facet = {
      flow: [{ $group: { _id: '$_id' } }],
      kek: [{ $unwind: '$result' },
        {
          $group: {
            _id: { course: '$result.course' },
            semesters: { $addToSet: '$result.semester' },
          },
        },
      ],
    }
    const $project1 = {
      flow: { $arrayElemAt: ['$flow', 0] },
      result: {
        $map: {
          input: '$kek',
          in: {
            course: { $substr: ['$$this._id.course', 0, -1] },
            semesters: '$$this.semesters',
          },
        },
      },
    }
    const $project2 = {
      flow: '$flow._id',
      courses: {
        $arrayToObject: {
          $map: {
            input: '$result',
            in: ['$$this.course', '$$this.semesters'],
          },
        },
      },
    }
    const aggregate = [
      { $group },
      { $facet },
      { $project: $project1 },
      { $project: $project2 },
    ]
    return ctx.body = await Abstract.aggregate(aggregate)
  })
  router.use('/api', cors(), api.routes(), api.allowedMethods())
}
