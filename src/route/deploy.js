const config = require('config')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const logger = require('../utils/logger')

module.exports = router => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('setted github hook path')
    router.post(config.githubHookPath, async ctx => {
      logger.info('on commit')
      const { ref } = ctx.request.body
      let stdout
      let stderr
      if (ref.includes('master')) {
        ({ stdout, stderr } = await exec(`pm2 deploy ${__dirname}/../../ecosystem.config.js production`))
      }
      if (ref.includes('dev')) {
        ({ stdout, stderr } = await exec(`pm2 deploy ${__dirname}/../../ecosystem.config.js development`))
      }
      logger.info('stdout:', stdout)
      logger.info('stderr:', stderr)
    })
  }
}
