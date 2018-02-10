const Teacher = require('../models/teacher')

module.exports = async ctx => {
  try {
    const surname = ctx.message.text.split(' ')[1]
    if (!surname)
      return ctx.replyWithHTML('Укажи фамилию преподавателя - /phone <i>фамилия (укр)</i>')

    const teachers = await Teacher.find({ last_name: surname.toLowerCase() })
    if (teachers.length > 0) {
      const answer = teachers.reduce((acc, val) => acc += val.phone_number
        ? `${val.full_name}:\n${formatPhoneNumber(val.phone_number)}\n`
        : '', '')
      ctx.reply(answer || 'Номер этого преподавателя мне не известен :c')
    } else {
      ctx.reply('Не нашел такого преподавателя, попробуй еще раз')
    }   
  } catch(e) {
    ctx.state.error(e)
  }
}

function formatPhoneNumber(number) {
  const array = number.split('')

  array.splice(2, 0, ' (')
  array.splice(6, 0, ') ')
  array.splice(10, 0, ' ')
  array.splice(13, 0, ' ')

  return '+' + array.join('')
}