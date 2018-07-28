const KoaRouter = require('koa-router')
const User = require('../db/models/user')
const groupService = require('../bot/service/group')
const logger = require('../utils/logger')
const errors = require('../errors')

const auth = new KoaRouter()

module.exports = router => {
  auth.use((ctx, next) => {
    ctx.set({
      'Access-Control-Allow-Origin': 'https://kpibot.me',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    })
    return next()
  })
  auth.use((ctx, next) => {
    logger.info(ctx.method, ctx.path)
    return next()
  })
  auth.post('/', async ctx => {
    const { user: userData } = ctx.request.body
    const dbUser = await User.findOne({ tgId: userData.tgId })
    if (dbUser) {
      return errors.badRequest('User already exists')
    }
    userData.registeredWithSite = true
    const user = new User(userData)
    await user.save()
    return user
  })
  auth.get('/login', async ctx => {
    const { id: tgId } = ctx.request.body
    const user = await User.findOne({ tgId })
    if (!user) {
      return ctx.body = null
    }
    return user
  })
  auth.get('/group/:id', async ctx => ctx.body = await groupService.processGroup(ctx.params.id))
  auth.post('/group', async ctx => {
    const { group } = ctx.request.body
    return ctx.body = await groupService.processGroup(group)
  })
  router.use('/auth', auth.routes())
}
