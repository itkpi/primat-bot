const router = require('express').Router(),
      Abstract = require('../models/abstract')

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  })
  next()
})

router.get('/abstracts/:id?', async (req, res) => {
  try {
    if (req.params.id) {
      const abstract = await Abstract.findById(req.params.id)
      return abstract ? res.json({ data: abstract }) : res.status(404).json({ data: null })
    }
    const { semester, flow, course } = req.query
    if (!(semester && flow && course))
      return res.json({ error: 'Expected id or three parameters: semester, flow, course' })

    const abstracts = await Abstract.aggregate([
      { $match: { flow, course: Number(course), semester: Number(semester) } },
      { $project: { text: 0, __v: 0 } }
    ]).sort({ date: 1 })

    if (!abstracts)
      return res.status(404).json({ data: null })

    const data = abstracts.reduce((data, lecture) => {
      if (!data[lecture.subject])
        data[lecture.subject] = []
      data[lecture.subject].push(lecture)
      return data
    }, {})

    res.json({ data })
  } catch(e) {
    console.error(e)
    res.status(500).json({ error: 'Error 500\nШось поломилося' })
  }
})

router.use((req, res, next) => {
  res.status(404).json({ error: 'wrong path' })
})

module.exports = router