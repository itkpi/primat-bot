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
}

module.exports = service
