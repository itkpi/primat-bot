const User = require('../models/user')

module.exports = (bot, ph, request, homeMarkup) => {
  bot.use((ctx, next) => ctx.session.user ? next() : null)

  bot.command('/deleteself', ctx => {
    if (config.ownerId == ctx.from.id) {
      User.remove({ tgId: ctx.from.id })
        .then(e => console.log('user removed'))
        .catch(e => console.log(e))
      ctx.reply('user has removed')
    }
  })
  bot.command('/deletesession', ctx => {
    if (config.ownerId == ctx.from.id) {
      ctx.session = null
      ctx.state.saveSession()
      ctx.reply('session has deleted', homeMarkup)
    }
  })

  bot.command('/telegraph', async ctx => {
    const tgId = ctx.from.id
    if (ctx.session.user.telegraph_user) {
      try {
        const user = await User.findOne({ tgId })
        if (user && !user.telegraph_token) {
          const account = await ph.createAccount('eee fam', {
            short_name: ctx.from.first_name,
            author_name: ctx.session.user.username
          })
          ctx.reply(
            `Все, теперь ты в теме. Вот линк для авторизации, если вдруг потеряешь акканут: ${account.auth_url}`
          )
          console.log(account)
          user.telegraph_token = account.access_token
          user.telegraph_authurl = account.auth_url
          user.save()
          
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
      await User.update({ tgId: ctx.from.id }, { $set: { unsubscriber: true } })
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
      console.log(user)
      if (user.telegraph_authurl && user.telegraph_token) {
        const url = `https://api.telegra.ph/getAccountInfo?access_token=${user.telegraph_token}&fields=["short_name","page_count", "auth_url"]`
        request(url, (err, data) => {
          if (err) throw new Error(err)
          const { auth_url } = JSON.parse(data.body).result
          user.telegraph_authurl = auth_url
          user.save()
          ctx.reply(`Отлично. Вот новая ссылка: ${user.telegraph_authurl}`)
        })
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
        config.routes.forEach(route => ctx.session[route] = null)
        ctx.state.saveSession()
        return ctx.reply('Оп, обновил', homeMarkup)
      }
    } catch(e) {
      return ctx.state.error(e)
    }  
  })
}
