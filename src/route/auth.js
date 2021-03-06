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
    const userData = ctx.request.body
    const dbUser = await User.findOne({ tgId: userData.tgId })
    if (dbUser) {
      return errors.badRequest('User already exists')
    }
    return ctx.body = await service.register(userData)
  })
  auth.post('/login', async ctx => {
    if (!service.checkSignature(ctx.request.body)) {
      return errors.logonFailed('Hash or user data is invalid')
    }
    const user = await User.findOne({ tgId: ctx.request.body.id })
    if (!user) {
      return errors.notFound('User with such telegram id is not registered')
    }
    return ctx.body = userService.filterSensitiveFields(user.toObject())
  })
  auth.get('/group/:id', async ctx => ctx.body = await groupService.processGroup(ctx.params.id, true))
  auth.post('/group', async ctx => ctx.body = await groupService.processGroup(ctx.request.body.group))
  router.use('/auth', auth.routes(), auth.allowedMethods())
}
