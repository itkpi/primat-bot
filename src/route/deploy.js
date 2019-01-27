const config = require('config')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const logger = require('../utils/logger')
const { version } = require('../../package.json')

module.exports = router => {
  if (process.env.NODE_ENV === 'development') {
    router.post(config.githubHookPath, async ctx => {
      const { ref, repository } = ctx.request.body
      logger.info(`on commit ${repository.full_name}`)
      let stdout
      let stderr
      switch (repository.id) {
        case config.primatBotRepoId: {
          if (ref.includes('master')) {
            ({ stdout, stderr } = await exec(`pm2 deploy ${__dirname}/../../ecosystem.config.js production --force`))
          }
          if (ref.includes('dev')) {
            ({ stdout, stderr } = await exec(`pm2 deploy ${__dirname}/../../ecosystem.config.js development --force`))
          }
          break
        }
        case config.diplomappRepoId: {
          ({ stdout, stderr } = await exec(`pm2 deploy ${__dirname}/../../ecosystem.config.js production --force`))
          break
        }
        default:
          logger.warn(`Unknown repository: ${repository.full_name}`)
      }
      logger.info('stdout:', stdout)
      logger.info('stderr:', stderr)
    })
  }
  router.get('/info', ctx => {
    ctx.body = { version }
  })
}
