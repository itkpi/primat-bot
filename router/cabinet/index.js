const { Markup } = require('telegraf'),
      { Router } = require('../../modules/utils'),
      changeGroup = require('./change-group'),
      subject = require('./subject'),
      action = require('./action'),
      course = require('./course')

const router = Router('cabinet',
  ctx => ctx.message.text !== config.btns.cabinet && !ctx.session.cabinet,
  ctx => ctx.session.cabinet && ctx.session.cabinet.nextCondition || 'cabinet')

router.on('cabinet', ctx => {
  ctx.session.cabinet = { nextCondition: 'action' }
  // const keyboard = ['Поменять группу', 'Сменить семестр', 'Кто я?', 'Команды', config.cabinet_btns.back]
  const keyboard = Object.values(config.cabinet_btns)
  if (ctx.session.user.telegraph_user)
    keyboard.push('📤 Загрузить лекцию')

  ctx.reply('Тут можешь притвориться кем-то другим', Markup
    .keyboard(keyboard, { columns: 2 }).resize().extra()
  )
  ctx.state.saveSession()
})

router.on('action', action)
router.on('changeGroup', changeGroup)
router.on('subject', subject)
router.on('course', course)

// this router triggers only when user has sent text message instead of document
router.on('upload', ctx => {
  if (ctx.state.btnVal === 'Отмена') {
    ctx.state.home('Очень жаль, я так люблю читать ваши лекции :c')
  } else {
    ctx.reply('Ну мне сложно принять это за файл')
  }
})

// this router triggers only when user has sent text message instead of photo
router.on('photo', ctx => {
  if (ctx.state.btnVal === 'Отмена') {
    ctx.state.home('Очень жаль, я так люблю читать ваши лекции :c')
  } else {
    ctx.reply('Фотография выглядит как изображение, если что')
  }  
})

module.exports = router.middleware()
