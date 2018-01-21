const getGroupId = require('./group-id'),
      currSem = require('./curr-sem')

module.exports = async group => {
  const result = { values: {} }
  if (group.match(/^((КВ)|(КМ)|(КП))-[1-9]{2}.?$/i)) {
    Object.assign(result.values, await parseGroup(group))
    result.who = 'primat'
  } else if (group.match(/^[А-яіє]{2,4}-[А-яіє]{0,2}[0-9]{2,3}[А-яіє]?\(?[А-яіє]*\)?\.?$/)) {
    Object.assign(result.values, await parseGroup(group))
    result.who = 'kpi'
  } else if (group === 'я не студент кпи') {
    result.values.date = new Date()
    result.values.semester = currSem()
    result.who = 'notstudent'
  }
  return result
}

async function parseGroup(group) {
  const date = new Date(),
        year = date.getFullYear() % 10,
        month = date.getMonth() + 1,
        flow = group.slice(0, 2),
        groupYear = Number(group.slice(-2, -1)),
        semester = currSem(date),
        course = month > 7 ? year - groupYear + 1 : year - groupYear,
        groupHubId = await getGroupId(group)

  if (course > 0 && course < 5 && group.length === 5 && groupHubId)
    return { date, group, groupHubId, flow, semester, course }

  return { date, group, groupHubId, semester, flow: null, course: null }
}