const service = {
  transformForTable(timetable) {
    const weeks = [1, 2]
    const days = [1, 2, 3, 4, 5, 6]
    const lessons = [1, 2, 3, 4, 5]
    return weeks.reduce((acc, weekNum) => {
      const week = timetable.weeks[weekNum]
      acc[weekNum] = {}
      days.forEach(dayNum => {
        lessons.forEach(lessonNum => {
          acc[weekNum][lessonNum] = acc[weekNum][lessonNum] || []
          acc[weekNum][lessonNum][dayNum - 1] = week.days[dayNum].lessons
            .find(lesson => Number(lesson.lesson_number) === lessonNum)
        })
      })
      return acc
    }, {})
  },
}

module.exports = service
