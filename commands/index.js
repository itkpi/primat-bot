const { bot, request, ph } = require('../modules/utils'),
      getFlows = require('../modules/groups-collector'),
      currSem = require('../modules/curr-sem'),
      KpiInfo = require('../models/kpi-info'),
      User = require('../models/user'),
      Building = require('../models/building'),

      start = require('./start')

module.exports = () => {
  bot.command('start', start)

  bot.use((ctx, next) => ctx.session.user || ctx.session.registry 
    ? next()
    : null
  )

  bot.command('/deleteself', async ctx => {
    if (config.ownerId == ctx.from.id) {
      try {      
        await User.remove({ tgId: ctx.from.id })
        const { username, tgId } = ctx.session.user
        console.log(`${username || tgId} has removed his document from the db`)
        ctx.reply('Your document in the db has removed')
      } catch(e) {
        ctx.state.error(e)
      }
    }
  })
  bot.command('/deletesession', ctx => {
    ctx.session = null
    ctx.state.saveSession()
    ctx.reply('session has deleted', ctx.state.homeMarkup)
  })
  bot.command('/updflows', async ctx => {
    if (config.ownerId == ctx.from.id) {
      try {
        const flows = await getFlows()
        await KpiInfo.findOneAndUpdate({ name: 'flows' }, { flows })
        ctx.reply('updated')
      } catch(e) {
        ctx.state.error(e)
      }
    }
  })

  bot.command('/telegraph', async ctx => {
    if (ctx.session.user.telegraph_user) {
      try {
        const tgId = ctx.from.id,
              user = await User.findOne({ tgId })

        if (user && !user.telegraph_token) {
          const account = await ph.createAccount('eee fam', {
            short_name: ctx.from.first_name,
            author_name: ctx.session.user.username || ctx.session.user.tgId
          })

          await User.update({ tgId }, {
            telegraph_token: account.access_token,
            telegraph_authurl: account.auth_url
          })

          ctx.reply(
            `Все, теперь ты в теме. Вот линк для авторизации, если вдруг потеряешь акканут: ${account.auth_url}`
          )
          
          ctx.session.user = user
          ctx.state.saveSession()
        } else if (user) {
          ctx.reply(
            `У тебя уже создан аккаунт в Телеграфе, можешь авторизироваться по этой ссылке: ` +
              `${user.telegraph_authurl}\nНикому не показывай!\nЕсли ссылка уже использована, можешь обновить ее ` +
              `командой /phupdate`
          )
        }
      } catch (e) {
        ctx.state.error(e)
      }
    }
  })

  bot.command('/unsub', async ctx => {
    try {
      await User.update({ tgId: ctx.from.id }, { unsubscriber: true })
      ctx.reply('Больше никаких уведомлений! (чтобы подписаться - /sub)')
    } catch (e) {
      ctx.state.error(e)
    }
  })
  bot.command('/sub', async ctx => {
    try {
      await User.update(
        { tgId: ctx.from.id },
        { $set: { unsubscriber: false } }
      )
      ctx.reply('Я тебя запомнил!')
    } catch (e) {
      ctx.state.error(e)
    }
  })

  bot.command('/phupdate', async ctx => {
    try {
      const user = await User.findOne({ tgId: ctx.from.id })

      if (user.telegraph_authurl && user.telegraph_token) {
        const url = `${config.telegraph_account_info_url}` +
                    `?access_token=${user.telegraph_token}&fields=["short_name","page_count", "auth_url"]`,
              { body } = await request(url),
              { auth_url } = JSON.parse(body).result

        await User.update({ tgId: ctx.from.id }, { telegraph_authurl: auth_url })
        ctx.reply(`Отлично. Вот новая ссылка для авторизации: ${auth_url}`)
      }
    } catch (e) {
      ctx.state.error(e)
    }
  })

  bot.command('/updsession', async ctx => {
    try {
      const user = await User.findOne({ tgId: ctx.from.id })
      if (user) {
        ctx.session.user = user
        ctx.state.clearRoutes()
        config.session_fields.forEach(field => ctx.session[field] = user[field])
        ctx.session.semester = currSem()
        ctx.state.saveSession()
        return ctx.reply('Оп, обновил', ctx.state.homeMarkup)
      }
    } catch(e) {
      return ctx.state.error(e)
    }  
  })

  bot.command('/hide_location', ctx => {
    User.findOneAndUpdate({ tgId: ctx.from.id }, { hideLocation: true })
    ctx.session.hideLocation = true
    ctx.state.saveSession()
    ctx.reply('Видимо, местоположение корпусов ты уже запомнил. Отлично!\n(/show_location - отображать)')
  })
  bot.command('/show_location', ctx => {
    User.findOneAndUpdate({ tgId: ctx.from.id }, { hideLocation: false })
    ctx.session.hideLocation = false
    ctx.state.saveSession()
    ctx.reply('Теперь ты всегда будешь знать куда идти!\n(/hide_location - скрывать)')
  })

  bot.command('/building', async ctx => {
    const num = ctx.message.text.split(' ')[1]
    if (!num)
      return ctx.reply('Укажи номер через пробел - /building 15')
    const building = await Building.findOne({ name: num })
    if (!building)
      return ctx.reply('Неизвестный мне номер :c')
    bot.telegram.sendLocation(ctx.from.id, building.latitude, building.longitude)
  })
}
