const Abstract = require('../db/models/abstract')

const weeksNums = [1, 2]
const daysNums = [1, 2, 3, 4, 5, 6]
const lessonsNums = [1, 2, 3, 4, 5]

const service = {
  transformForTable(timetable) {
    return weeksNums.reduce((acc, weekNum) => {
      const week = timetable.weeks[weekNum]
      acc[weekNum] = {}
      daysNums.forEach(dayNum => {
        lessonsNums.forEach(lessonNum => {
          acc[weekNum][lessonNum] = acc[weekNum][lessonNum] || []
          acc[weekNum][lessonNum][dayNum - 1] = week.days[dayNum].lessons
            .find(lesson => Number(lesson.lesson_number) === lessonNum)
        })
      })
      return acc
    }, {})
  },
  transformTeacherLessons(lessons) {
    const timetable = {
      weeks: { 1: { week_number: 1, days: {} }, 2: { week_number: 2, days: {} } },
    }
    lessons.forEach(lesson => {
      const { days } = timetable.weeks[lesson.lesson_week]
      days[lesson.day_number] = days[lesson.day_number] || {}
      const day = days[lesson.day_number] || {}
      if (!day.lessons) {
        day.day_name = lesson.day_name
        day.day_number = lesson.day_number
        day.lessons = []
      }
      day.lessons.push(lesson)
    })
    return timetable
  },
  transformTeacherLessonsForTable(lessons) {
    return weeksNums.reduce((acc, weekNum) => {
      acc[weekNum] = {}
      daysNums.forEach(dayNum => {
        lessonsNums.forEach(lessonNum => {
          acc[weekNum][lessonNum] = acc[weekNum][lessonNum] || []
          acc[weekNum][lessonNum][dayNum - 1] = lessons.find(
            lesson => Number(lesson.lesson_week) === weekNum
                   && Number(lesson.day_number) === dayNum
                   && Number(lesson.lesson_number) === lessonNum,
          )
        })
      })
      return acc
    }, {})
  },
  getAbstractsInfo() {
    const $group = {
      _id: '$flow',
      result: { $addToSet: { course: '$course', semester: '$semester' } },
    }
    const $facet = {
      flow: [{ $group: { _id: '$_id' } }],
      courses: [
        { $unwind: '$result' },
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
          input: '$courses',
          in: {
            course: { $toString: '$$this._id.course' },
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
    return Abstract.aggregate(aggregate)
  },
  getAbstracts({ flow, course, semester }) {
    const aggregate = [{
      $match: {
        semester: { $eq: Number(semester) },
        flow: { $eq: flow },
        course: { $eq: Number(course) },
      },
    }, {
      $group: {
        _id: '$subject',
        abstracts: {
          $push: {
            id: '$_id',
            flow: '$flow',
            course: '$course',
            author: '$author',
            semester: '$semester',
            authorId: '$authorId',
            date: '$date',
            url: '$url',
            path: '$path',
            title: '$title',
          },
        },
      },
    }, {
      $project: {
        _id: 0,
        subject: '$_id',
        abstracts: '$abstracts',
      },
    }]
    return Abstract.aggregate(aggregate)
  },
  getAbstractById(id) {
    return Abstract.findById(id, '-__v')
  },
}

module.exports = service
