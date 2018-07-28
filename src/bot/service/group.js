const rozklad = require('node-rozklad-api')
const userService = require('./user')
const univerService = require('./univer')

const service = {
  async processGroup(group) {
    if (group instanceof Object) {
      return this.transformGroup(group)
    }
    const [groupInfo, possibleGroups] = await Promise.all([
      rozklad.groups(group),
      rozklad.groups({ search: { query: group } }),
    ])
    console.log('groupInfo', groupInfo)
    if (!groupInfo || (possibleGroups && possibleGroups.length > 1)) {
      return possibleGroups
    }
    return this.transformGroup(groupInfo)
  },
  async transformGroup(group) {
    return {
      groupId: group.group_id,
      flow: group.group_prefix,
      groupOkr: group.group_okr,
      groupType: group.group_type,
      group: group.group_full_name,
      groupScheduleUrl: group.group_url,
      course: await this.getCourse(group.group_full_name),
    }
  },
  async getCourseByOther(group) {
    const user = await userService.getByGroup(group)
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
