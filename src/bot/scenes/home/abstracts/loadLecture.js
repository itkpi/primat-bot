const config = require('config')
const Scene = require('telegraf/scenes/base')
// const { Markup } = require('telegraf')
// const scheduleService = require('../../../service/schedule')
// const ignoreCommand = require('../../../utils/ignoreCommand')

const sceneName = config.scenes.home.abstracts.loadLecture
const scene = new Scene(sceneName)

scene.enter(async ctx => {
  ctx.reply('Выбирай предмет')
  // const subjects = await scheduleService.parseSchedule(ctx.session.groupId, 'subjects')
})

module.exports = scene
