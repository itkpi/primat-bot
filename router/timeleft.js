module.exports = ctx => {
    if (config.routes.filter(route => ctx.session[route]).length !== 0)
      return

    const len = 60 + 35, // 1:35
        shift = 60 + 55, // 1:55
        firstStart = 60 * 8 + 30, // 8:30

        date = new Date(),
        month = date.getMonth() + 1,
        UTCshift = month > 3 && month < 11 ? 3 : 2,

        timeNow = new Date(new Date().getTime() + UTCshift * 60 * 60 * 1000),
        hours = timeNow.getUTCHours(),
        minutes = timeNow.getUTCMinutes(),
        curr = 60 * hours + minutes

    let flag = false,
        response

    for (let i = 0; i < 5; i++) {
        const start = firstStart + shift * i,
            end = start + len;

        if (curr > start && curr < end) {
            flag = true
            const m = end - curr
            
            let ending
            if (m % 10 == 1)
                if (m == 11)
                    ending = 'минуточек'
                else
                    ending = 'минуточка'
            else if (m % 10 < 5 && m % 10 != 0)
                if (m > 10 && m < 15)
                    ending = 'минуточек'
                else
                    ending = 'минуточки'
            else
                ending = 'минуточек'

            response = `Тебе осталось ${m} ${ending}`
            break
        }
    }

    flag ? ctx.reply(response, ctx.state.homeMarkup) 
         : ctx.reply('Тебе повезло, ты не на паре', ctx.state.homeMarkup)
}