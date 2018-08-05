const config = require('config')
const picasa = require('../../modules/picasa')

module.exports = () => new Promise((resolve, reject) => {
  const params = {
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
  }
  picasa.renewAccessToken(params, config.picasaRefreshToken,
    (err, token) => err ? reject(err) : resolve(token))
})
