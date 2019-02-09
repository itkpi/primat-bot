const { deploy } = require('config')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const logger = require('../utils/logger')
const { version } = require('../../package.json')

module.exports = router => {
  if (process.env.NODE_ENV === 'development') {
    router.post(deploy.githubHookPath, async ctx => {
      const { ref, repository } = ctx.request.body
      logger.info(`on commit ${repository.full_name}`)
      let stdout
      let stderr
      switch (repository.id) {
        case deploy.kpiBot.repoId: {
          if (ref.includes('master')) {
            ({ stdout, stderr } = await exec(deploy.kpiBot.prodCommand))
          }
          if (ref.includes('dev')) {
            ({ stdout, stderr } = await exec(deploy.kpiBot.devCommand))
          }
          break
        }
        case deploy.diplomapp.repoId: {
          ({ stdout, stderr } = await exec(deploy.diplomapp.command))
          break
        }
        case deploy.jediBot: {
          if (ref.includes('master')) {
            ({ stdout, stderr } = await exec(deploy.jediBot.prodCommand))
          }
          if (ref.includes('dev')) {
            ({ stdout, stderr } = await exec(deploy.jediBot.devCommand))
          }
          break
        }
        default:
          logger.warn(`Unknown repository: ${repository.full_name}`)
      }
      if (stdout || stderr) {
        logger.info('stdout:', stdout)
        logger.info('stderr:', stderr)
      }
    })
  }
  router.get('/info', ctx => {
    ctx.body = { version }
  })
}
