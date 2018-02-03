const Teacher = require('../../models/teacher')

module.exports = async ctx => {
  if (ctx.state.btnVal === 'Домой')
    return ctx.state.home('Удачи!')

  const teachers = await Teacher.find({ last_name: ctx.state.btnVal.toLowerCase() })
  if (teachers.length > 0) {
    const answer = teachers.reduce((acc, val) => acc += val.phone_number
      ? `${val.full_name}:\n${formatPhoneNumber(val.phone_number)}\n`
      : '', '')
    ctx.reply(answer || 'Номер этого преподавателя мне не известен :c')
  } else {
    ctx.reply('Не нашел такого преподавателя, попробуй еще раз')
  }
}

function formatPhoneNumber(number) {
    array = number.split('')

    array.splice(2, 0, ' (')
    array.splice(6, 0, ') ')
    array.splice(10, 0, ' ')
    array.splice(13, 0, ' ')

    return '+' + array.join('')
}