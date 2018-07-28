const RequestError = require('../errors/RequestError')

if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', { // eslint-disable-line no-extend-native
    value() {
      const alt = {}
      Object.getOwnPropertyNames(this).forEach(key => {
        alt[key] = this[key]
      }, this)
      return alt
    },
    configurable: true,
    writable: true,
  })
}

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    e.status = e.status || 500
    ctx.status = e.status
    if (e instanceof RequestError) {
      ctx.message = e.message
    }
    if (ctx.app.env === 'development') {
      ctx.body = e
    }
    ctx.app.emit('error', e, ctx)
  }
}
