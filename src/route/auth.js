// const config = require('config')
const KoaRouter = require('koa-router')
const User = require('../db/models/user')
const groupService = require('../bot/service/group')
const userService = require('../bot/service/user')
// const logger = require('../utils/logger')
const errors = require('../errors')

const auth = new KoaRouter()

module.exports = router => {
  auth.use((ctx, next) => {
    ctx.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    })
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
    return ctx.body = await user.save()
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
  router.use('/auth', auth.routes())
}