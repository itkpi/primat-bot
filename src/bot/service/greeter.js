const config = require('config')
const { Markup } = require('telegraf')
const groupService = require('./group')
const userService = require('./user')

const { scenes } = config

const service = {
  welcome(firstName) {
    const msg = `Привет, <b>${firstName}</b>!\n\nЯ рад, что ты нашел меня. Я могу быть полезным, `
      + 'но для нашего хорошего общения мне нужно лучше узнать тебя. '
      + 'Имя я уже записал, но из какой ты группы?\n\nИспользуй подобный формат: kv-51, іс-52'
    const keyboard = Markup.keyboard(Object.values(config.btns.greeter)).resize().extra()
    return { msg, keyboard }
  },
  register(data, role) {
    return userService.createUser(Object.assign({}, data, { role }))
  },
  async registerByGroup(group, userData) {
    const groupData = typeof group === 'string'
      ? await groupService.processGroupByName(group)
      : await groupService.transformGroup(group)
    if (!groupData) {
      return { fail: 'Впервые вижу такую группу. Ты уверен, что все правильно написал? Попробуй еще раз' }
    }
    if (Array.isArray(groupData)) {
      const groups = groupData.slice(0, 6)
      const msg = ['Я не нашел этой группы, но попробуй кое-что похожее:\n']
        .concat(groups.map((item, i) => `${i + 1}. ${item.group_full_name}`))
        .join('\n')
      const keyboardValues = groups.map((_, i) => (i + 1).toString())
      const keyboard = Markup.keyboard(keyboardValues, { columns: 3 }).resize().extra()
      const nextScene = {
        name: scenes.greeter.chooseGroup,
        state: {
          msg,
          keyboard,
          groups,
        },
      }
      return { nextScene }
    }
    const registryData = Object.assign({}, userData, groupData, { role: 'student' })
    if (!registryData.course) {
      const courses = new Array(6)
      for (let i = 0; i < courses.length; i += 1) {
        courses[i] = (i + 1).toString()
      }
      const keyboard = Markup.keyboard(courses, { columns: 3 }).resize().extra()
      const nextScene = {
        name: scenes.greeter.setCourse,
        state: {
          msg: 'Почти закончили. Напиши еще свой курс',
          keyboard,
          registryData,
        },
      }
      return { nextScene }
    }
    const user = await userService.createUser(registryData)
    return { user }
  },
}

module.exports = service
