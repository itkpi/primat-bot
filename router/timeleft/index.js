module.exports = ctx => {
  const len = 60 + 35, // 1:35
        shift = 60 + 55, // 1:55
        firstStart = 60 * 8 + 30, // 8:30

        date = new Date(),
        month = date.getMonth() + 1,
        UTCshift = month > 3 && month < 11 ? 3 : 2,

        timeNow = new Date(date.getTime() + UTCshift * 60 * 60 * 1000),
        hours = timeNow.getUTCHours(),
        minutes = timeNow.getUTCMinutes(),
        curr = 60 * hours + minutes

  let flag = false,
      response

  for (let i = 0; i < 5; i++) {
    const start = firstStart + shift * i,
          end = start + len

    if (curr > start && curr < end) {
      flag = true
      const m = end - curr

      let ending
      if (m % 10 == 1)
        ending = m == 11 ? 'минуточек' : 'минуточка'
      else if (m % 10 < 5 && m % 10 != 0)
        ending = m > 10 && m < 15 ? 'минуточек' : 'минуточки'
      else
        ending = 'минуточек'

      response = `Тебе осталось ${m} ${ending}`
      break
    }
  }

  flag ? ctx.state.home(response)
    : ctx.state.home('Тебе повезло, ты не на паре')
}