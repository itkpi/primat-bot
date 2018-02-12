module.exports = ctx => {
  const course = ctx.message.text.trim()
  if (course > 0 && course < 7) {
    ctx.session.course = course
    ctx.state.home('Готово')
  } else {
    ctx.reply('Какой-какой курс? Попробуй еще раз')
  }
}
