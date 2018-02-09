const { r } = require('./utils')

module.exports = async (groupId, param) => {
    const timetable = await r.lessons(groupId),
        weeks = [1, 2],
        days = [1, 2, 3, 4, 5, 6],
        nums = [0, 1, 2, 3, 4],
        result = {
          subjects: [],
          teachers: {}
        }

  weeks.forEach(week => days.forEach(dayNum => {
    const day = timetable.weeks[week].days[dayNum]
    if (day) {
      nums.forEach(i => {
        const { 
          lesson_name: subject,
          teachers,
          lesson_full_name
        } = day.lessons[i] || {}

        if (teachers && lesson_full_name && teachers.length > 0) {
          if (!result.teachers[lesson_full_name])
            result.teachers[lesson_full_name] = []

          const teacher = teachers[0].teacher_full_name || teachers[0].teacher_name
          if (!result.teachers[lesson_full_name].includes(teacher))
            result.teachers[lesson_full_name].push(teacher)
        }

        if (subject && !result.subjects.includes(subject))
            result.subjects.push(subject)
      })
    }
  }))

  return result[param]
}