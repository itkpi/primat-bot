const User = require('../models/user'),
      { request } = require('../modules/utils')

module.exports = async ctx => {
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
}