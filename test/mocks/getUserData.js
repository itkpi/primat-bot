const getRandomString = require('./getRandomString')

module.exports = () => ({
  tgId: getRandomString(),
  username: 'test',
  firstName: 'firstName',
  lastName: 'lastName',
})
