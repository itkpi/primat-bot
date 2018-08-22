const config = require('config')
const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const User = require('../db/models/user')
const groupService = require('../bot/service/group')
const userService = require('../bot/service/user')
const service = require('../service/auth')
const errors = require('../errors')

const auth = new KoaRouter()

module.exports = router => {
  auth.use(cors())
  auth.post('/', async ctx => {
    const { user: userData } = ctx.request.body
    if (!userData) {
      return errors.badRequest('User field doesn\'t provided')
    }
    const dbUser = await User.findOne({ tgId: userData.tgId })
    if (dbUser) {
      return errors.badRequest('User already exists')
    }
    return ctx.body = await service.register(userData)
  })
  auth.post('/login', async ctx => {
    console.log('ctx.request.body', ctx.request.body)
    if (!service.checkSignature(config.botToken, ctx.request.body)) {
      return errors.logonFailed('Hash or user data is invalid')
    }
    const user = await User.findOne({ tgId: ctx.body.id })
    if (!user) {
      return errors.notFound('User with such telegram id is not registered')
    }
    return ctx.body = userService.filterSensitiveFields(user)
  })
  auth.get('/group/:id', async ctx => ctx.body = await groupService.processGroup(ctx.params.id))
  auth.post('/group', async ctx => {
    const { group } = ctx.request.body
    return ctx.body = await groupService.processGroup(group)
  })
  router.use('/auth', auth.routes(), auth.allowedMethods())
}
