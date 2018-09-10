module.exports = ({ username, firstName, lastName }) => {
  if (username) {
    return `@${username}`
  }
  if (lastName) {
    return `${firstName} ${lastName}`
  }
  return firstName
}
