const currSem = require('./curr-sem'),
      { r } = require('./utils')

// regex: /^[А-яіє]{2,4}-[А-яіє]{0,2}[0-9]{2,3}[А-яіє]?\(?[А-яіє]*\)?\.?$/

module.exports = async group => {
  if (parseInt(group))
    return
  
  // stupid api that can't search by full name so use hack
  group = group.split(' ')

  let rGroup = await r.group(group[0])

  if (!rGroup) {
    const possibleGroups = await r.group({ search: { query: group[0] } })
    
    // if there no spaces into group name
    if (group.length === 1)
      return possibleGroups

    rGroup = possibleGroups[0]
  }

  const res = {
    rGroupId: rGroup.group_id,
    group: rGroup.group_full_name,
    flow: rGroup.group_prefix,
    groupOkr: rGroup.group_okr,
    groupType: rGroup.group_type,
    groupScheduleUrl: rGroup.group_url,
    semester: currSem(),
    course: getCourse(rGroup.group_full_name)
  }
  
  return res
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