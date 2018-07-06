const { homeMessages } = require('config')

module.exports = () => {
  const indx = Math.floor(Math.random() * homeMessages.length)
  return homeMessages[indx]
}
