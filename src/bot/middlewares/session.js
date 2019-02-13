function getWrappedStorage(storage) {
  const $set = {}
  const $unset = {}
  const access = new Proxy(storage, {
    get(target, property) {
      switch (property) {
        case '__changeset':
        {
          const ret = {}
          if (Object.keys($set).length > 0) {
            Object.assign(ret, { $set })
          }
          if (Object.keys($unset).length > 0) {
            Object.assign(ret, { $unset })
          }
          return ret
        }
        case 'toJSON':
          return () => target
        default:
          return Reflect.get(target, property)
      }
    },
    set(target, property, value) {
      Reflect.set(target, property, value)
      $set[`data.${property}`] = value
      delete $unset[`data.${property}`]
      return true
    },
    deleteProperty(target, property) {
      Reflect.deleteProperty(target, property)
      delete $set[`data.${property}`]
      $unset[`data.${property}`] = ''
      return true
    },
  })
  return access
}

class MongoSession {
  constructor(client, options) {
    this.options = Object.assign({
      property: 'session',
      collection: 'sessions',
      getSessionKey(ctx) {
        if (!ctx.chat || !ctx.from) {
          return false
        }
        return `${ctx.chat.id}:${ctx.from.id}`
      },
      store: {},
    }, options)
    this.collection = client.collection(this.options.collection)
  }

  async getSession(key) {
    const document = await this.collection.findOne({ key })
    return (document || { data: {} }).data
  }

  saveSession(key, data) {
    if (!data || Object.keys(data).length === 0) {
      return this.collection.deleteOne({ key })
    }
    return this.collection.updateOne({ key }, data.__changeset, { upsert: true })
  }

  get middleware() {
    return async (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      let session = getWrappedStorage(await this.getSession(key))
      Object.defineProperty(ctx, this.options.property, {
        get() { return session },
        set(value) { session = Object.assign({}, value) },
      })

      await next()
      return this.saveSession(key, session)
    }
  }

  async setup() {
    await this.collection.createIndex({ key: 1 })
  }
}

module.exports = MongoSession
