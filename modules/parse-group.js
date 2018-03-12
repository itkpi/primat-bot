const currSem = require('./curr-sem'),
      { r } = require('./utils')

module.exports = async group => {
  const [rGroup, possibleGroups] = await Promise.all([
    r.groups(group),
    r.groups({ search: { query: group } })
  ])

  if (!rGroup) {
    if (!possibleGroups)
      return null

    return possibleGroups
  } else if (possibleGroups && possibleGroups.length > 1) {
    return { type: 'choice', groups: possibleGroups.map(parseData) }
  }

  return parseData(rGroup)
}

function parseData(rGroup) {
  return {
    rGroupId: rGroup.group_id,
    group: rGroup.group_full_name,
    flow: rGroup.group_prefix,
    groupOkr: rGroup.group_okr,
    groupType: rGroup.group_type,
    groupScheduleUrl: rGroup.group_url,
    semester: currSem(),
    course: getCourse(rGroup.group_full_name)
  }
}

function getCourse(group) {
  if (!group.match(/^.{2}-[1-9]{2}$/i))
    return

  const date = new Date(),
        year = date.getFullYear() % 10,
        month = date.getMonth() + 1,
        groupYear = Number(group.slice(-2, -1)),
        course = month > 7 ? year - groupYear + 1 : year - groupYear

  return course > 0 && course < 5
    ? course
    : null
}
