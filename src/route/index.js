module.exports = router => {
  router.get('/', ctx => {
    ctx.body = 'Hello'
  })
  return router.routes()
}
