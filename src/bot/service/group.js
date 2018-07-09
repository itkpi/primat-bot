const rozklad = require('node-rozklad-api')
const User = require('../../db/models/user')
const univerService = require('./univer')

const service = {
  async processGroupByName(groupName) {
    const [group, possibleGroups] = await Promise.all([
      rozklad.groups(groupName),
      rozklad.groups({ search: { query: groupName } }),
    ])
    if (!group || (possibleGroups && possibleGroups.length > 1)) {
      return possibleGroups
    }
    return this.transformGroup(group)
  },
  async transformGroup(group) {
    return {
      rGroupId: group.group_id,
      flow: group.group_prefix,
      groupOkr: group.group_okr,
      groupType: group.group_type,
      group: group.group_full_name,
      groupScheduleUrl: group.group_url,
      course: await this.getCourse(group.group_full_name),
    }
  },
  async getCourseByOther(group) {
    const user = await User.findOne({ group })
    return user && user.course
  },
  async getCourse(group) {
    if (!group.match(/^.{2}-[1-9]{2}$/i)) {
      return this.getCourseByOther(group)
    }
    const date = new Date()
    const year = date.getFullYear() % 10
    const groupYear = Number(group.slice(-2, -1))
    const currSemester = await univerService.getCurrSemester()
    const course = currSemester === 1
      ? year - groupYear
      : year - groupYear + 1
    if (course < 0 || course > 4) {
      return this.getCourseByOther(group)
    }
    return course
  },
}

module.exports = service
