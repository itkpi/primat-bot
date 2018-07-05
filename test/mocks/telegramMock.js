const config = require('config')
const nock = require('nock')

module.exports = {
  sendMessage() {
    return nock(config.telegramHost)
      .persist()
      .post(`/bot${config.botToken}/sendMessage`)
      .reply(200, { ok: true })
  },
}
