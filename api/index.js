const router = require('express').Router(),
  Abstract = require('../models/abstract'),
  KpiInfo = require('../models/kpi-info'),
  mongoose = require('mongoose')

router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  })
  next()
})

router.get('/info', async (req, res) => {
  try {
    const o = {
      map: function() {
        emit(this.flow, `${this.course}_${this.semester}`)
      },
      reduce: function(k, courses) {
        return JSON.stringify(courses
          .filter((c, i, self) => self.indexOf(c) === i)
          .reduce((acc, value) => {
            const [course, semester] = value.split('_')
            if (!acc[course])
              acc[course] = { semesters: [] }
            if (!acc[course].semesters.includes(semester))
              acc[course].semesters.push(semester)
            return acc
          }, { }))
      }
    }
    const resp = (await Abstract.mapReduce(o))
      .map(({ _id, value }) => ({ flow: _id, courses: JSON.parse(value) }))

    console.log(resp)
    res.json({ data: resp })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Db error' })
  }
})

router.get('/flows', async (req, res) => {
  try {
    const { flows } = await KpiInfo.findOne({ name: 'flows' })
    res.json({ data: flows })
  } catch(e) {
    console.error(e)
    res.status(500).json({ error: '500 shit happens' })
  }
})

router.get('/meta', async (req, res) => {
  try {
    const data = await Abstract.aggregate(
      [{ $group: { _id: { course: '$course', semester: '$semester', flow: '$flow' } } }]
    )
    res.json({ data })
  } catch(e) {
    console.error(e)
    res.status(500).json({ error: '500 shit happens' })
  }
})
// router.get('/meta2', async (req, res) => {
//   try {
//     const result = await Abstract.aggregate(
//       [{ $group: { _id: { course: '$course', semester: '$semester', flow: '$flow' } } }]
//     )
//     const data = result
//       .reduce((acc, { _id: item }) => {
//         const flow = acc.find(({ name }) => name === item.flow)
//         if (flow) {
//           const course = flow.courses.find(({ num }) => num === item.course)
//           if (!course)
//             flow.courses.push({ num: item.course, semesters: [item.semester] })
//           else
//             course.semesters = courses.semesters.includes(item.semester)
//               ? courses.semesters
//               : courses.semesters.concat(item.semester)
//         } else {
//           acc.push({
//             name: item.flow,
//             courses: [{ num: item.course, semesters: [item.semester] }]
//           })
//         // flow.name = item.flow
//         // flow.courses = [{ num: item.course, semesters: [item.semester] }]
//         }
//         return acc
//       }, [])
//     console.log(data)
//     res.json({ data })
//   } catch(e) {
//     console.error(e)
//     res.status(500).json({ error: '500 shit happens' })
//   }
// })
router.get('/abstracts/:id?', async (req, res) => {
  try {
    const { id } = req.params
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).json({ error: 'Invalid id' })

      const abstract = await Abstract.findById(id)
      return abstract 
        ? res.json({ data: abstract })
        : res.status(404).json({ data: null })
    }

    const { semester, flow, course } = req.query
    if (!(semester && flow && course))
      return res.json({ error: 'Expected id or three parameters: semester, flow, course' })

    const abstracts = await Abstract.aggregate([
      { $match: { flow, course: Number(course), semester: Number(semester) } },
      { $project: { text: 0, __v: 0 } }
    ]).sort({ date: 1 })

    if (!abstracts)
      return res.json({ data: null })

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

module.exports = router