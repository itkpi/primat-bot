const config = require('config')
const { Markup } = require('telegraf')
const groupService = require('./group')
const userService = require('./user')
const sessionService = require('./session')

const { scenes } = config

const service = {
  welcome(firstName) {
    const msg = `Привет, <b>${firstName}</b>!\n\nЯ рад, что ты нашел меня. Я могу быть полезным, `
      + 'но для нашего хорошего общения мне нужно лучше узнать тебя. '
      + 'Имя я уже записал, но из какой ты группы?\n\nИспользуй подобный формат: kv-51, іс-52'
    const keyboard = Markup.keyboard(Object.values(config.btns.greeter)).resize().extra()
    return { msg, keyboard }
  },
  async register(data, role, session) {
    const user = await userService.create(Object.assign({}, data, { role }))
    await sessionService.setByUser(user, session)
    return user
  },
  async registerByGroup(group, userData, session) {
    const groupData = await groupService.processGroup(group)
    if (!groupData) {
      return { fail: 'Впервые вижу такую группу. Ты уверен, что все правильно написал? Попробуй еще раз' }
    }
    if (Array.isArray(groupData)) {
      return this.getChooseGroupScene(groupData)
    }
    Object.assign(userData, groupData)
    if (!userData.course) {
      return this.getSetCourseScene(userData)
    }
    const user = await this.register(userData, config.roles.student, session)
    return { user }
  },
  registerByTeacher(teacher, userData, session) {
    const teacherData = {
      teacherId: teacher.teacher_id,
      tName: teacher.teacher_name,
      tFullName: teacher.teacher_full_name,
      tShortName: teacher.teacher_short_name,
      tScheduleUrl: teacher.teacher_url,
      tRating: teacher.teacher_rating,
    }
    userData.settings = { scheduleLocationShowing: false }
    return this.register(Object.assign({}, userData, teacherData), config.roles.teacher, session)
  },
  getChooseGroupScene(groups, ops = {}) {
    groups = groups.slice(0, 6)
    const msg = 'У меня есть несколько вариантов для тебя'
    const buttons = groups.map(group => group.group_full_name)
    if (ops.showCancel) {
      buttons.push(config.btns.cancel)
    }
    const keyboard = Markup.keyboard(buttons, { columns: 3 }).resize().extra()
    const nextScene = {
      name: scenes.greeter.chooseGroup,
      state: { groups, allowCancel: ops.showCancel },
    }
    return { nextScene, currState: { msg, keyboard } }
  },
  getSetCourseScene(userData, ops = {}) {
    const courses = new Array(6)
    for (let i = 0; i < courses.length; i += 1) {
      courses[i] = (i + 1).toString()
    }
    if (ops.showCancel) {
      courses.push(config.btns.cancel)
    }
    const keyboard = Markup.keyboard(courses, { columns: 3 }).resize().extra()
    const msg = 'Почти закончили. Укажи еще номер курса'
    const nextScene = {
      name: scenes.greeter.setCourse,
      state: { userData, allowCancel: ops.showCancel },
    }
    return { nextScene, currState: { msg, keyboard } }
  },
  getChooseTeacherScene(teachers) {
    const msg = 'Еще немножко'
    const buttons = teachers.map(item => item.teacher_full_name || item.teacher_name)
    const keyboard = Markup.keyboard(buttons, { columns: 3 }).resize().extra()
    const nextScene = {
      name: scenes.greeter.chooseTeacher,
      state: { teachers },
    }
    return { nextScene, currState: { msg, keyboard } }
  },
}

module.exports = service
