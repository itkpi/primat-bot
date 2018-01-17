module.exports = function (opts) {
  opts = Object.assign({
    property: 'sceneSession',
    getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
  }, opts)

  const ttlMs = opts.ttl && opts.ttl * 1000
  const store = new Map()

  return (ctx, next) => {
    const key = opts.getSessionKey(ctx)
    if (!key) {
      return next(ctx)
    }
    const now = new Date().getTime()
    let { sceneSession, expires } = store.get(key) || { sceneSession: {} }
    if (expires && expires < now) {
      sceneSession = {}
    }
    Object.defineProperty(ctx, opts.property, {
      get: function () { return sceneSession },
      set: function (newValue) { sceneSession = Object.assign({}, newValue) }
    })
    return next(ctx).then(() => store.set(key, {
      sceneSession,
      expires: ttlMs ? now + ttlMs : null
    }))
  }
}
