module.exports = (date = new Date()) => {
  const month = date.getMonth() + 1,
    semester = month > 7 && month <= 12 ? 1 : 2

  return semester
}