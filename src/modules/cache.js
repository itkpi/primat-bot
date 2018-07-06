const Cache = require('ttl')

const cache = new Cache({
  ttl: 1000 * 60 * 60 * 24 * 6, // 6 days
})

module.exports = cache
