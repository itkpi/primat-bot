const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const User = require('../db/models/user')
const groupService = require('../bot/service/group')
const userService = require('../bot/service/user')
const service = require('../service/auth')
const errors = require('../errors')

const auth = new KoaRouter()

module.exports = router => {
  // auth.use((ctx, next) => {
  //   ctx.set({
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  //     'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  //   })
  //   return next()
  // })
  // auth.use((ctx, next) => {
  //   console.log('headers', ctx.request.header)
  //   return next()
  // })
  // auth.use(cors({ origin: '*' }))
  // auth.use(async (ctx, next) => {
  //   ctx.set('Access-Control-Allow-Credentials', 'true')
  //   'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  //   ctx.set('Access-Control-Allow-Origin', '*')
  //   await next()
  // })

  // api options method
  // auth.options('*', async (ctx, next) => {
  //   ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  //   ctx.set('Access-Control-Allow-Origin', '*')
  //   ctx.status = 204
  //   await next()
  // })

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
  auth.get('/login/:tgId', async ctx => {
    /* TODO: check hash */
    const { tgId } = ctx.params
    const user = await User.findOne({ tgId })
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
