const User = require('../models/user'),
      { ph } = require('../modules/utils')

module.exports = async ctx => {
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
          'У тебя уже создан аккаунт в Телеграфе, можешь авторизироваться по этой ссылке: ' +
            `${user.telegraph_authurl}\nНикому не показывай!\nЕсли ссылка уже использована, можешь обновить ее ` +
            'командой /phupdate'
        )
      }
    } catch (e) {
      ctx.state.error(e)
    }
  }
}
