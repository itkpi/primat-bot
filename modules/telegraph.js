const { parseFragment, serialize, parse: pparse } = require('parse5'),
      Abstract = require('../models/abstract'),
      User = require('../models/user'),
      currSem = require('../modules/curr-sem'),
      { ph } = require('../modules/utils'),

      getReg = num => new RegExp(`[${num}]`, 'g'),
      replaceString = process.env.REPLACE_STRING


async function createPage(ctx, name, page, source, photos = []) {
  console.log(source)
  if (photos.length > 0) {
    const putPhotos = (input, photos) => 
      JSON.parse(photos.reduce((acc, link, indx) => 
        acc.replace(`${indx + 1}${replaceString}`, link), JSON.stringify(input))
      )
    
    page = putPhotos(page, photos)
    source = putPhotos(source, photos)
  }
  const response = await ph.createPage(ctx.session.user.telegraph_token, name, page, { return_content: true })
  
  // if (process.env.STATUS === 'prod') {
    const { subject } = ctx.session.cabinet,
          { course, flow, username: author = ctx.from.id } = ctx.session.user,
          semester = currSem(),

          abstract = new Abstract({
            flow,
            name,
            course,
            author,
            source,
            subject,
            semester,
            authorId: ctx.from.id,
            telegraph_url: response.url,
            telegraph_path: response.path,
            telegraph_title: response.title
          })

    abstract.save()
    console.log(
      `${author || ctx.from.id} has saved new lecture [${flow}, ${course} course, ${semester} semester]: ${subject} | ${name}`
    )
  // }

  return response
}

function parse(text) {
  const lectureName  = text.substring(0, text.indexOf('\n')) // get first line
        text         = text.substring(text.indexOf('\n') + 1)  // remove first line
  const numObj       = { num: 1 }, // convert will modify it
        parsed       = parseFragment(text),
        page         = convert(numObj)(parsed.childNodes),
        source       = serialize(parsed),
        photosAmount = numObj.num - 1

  // const test = pparse(text)
  // console.log(test)
  // console.log(serialize(test))
  // console.log(serialize(source))

  return { lectureName, page, photosAmount, source }
}

function convert(numObj) {
  return nodes => nodes.map(node => {
    if (node.value && node.value.trim() == '') return
    if (node.childNodes) {
      node.children = convert(numObj)(node.childNodes)
    }
    let src
    if (node.tagName === 'img') {
      const reg = getReg(numObj.num)
      src = node.attrs.find(i => i.name === 'src')

      if (src.value.match(reg)) {
        node.attrs.find(i => i.name === 'src').value = `${numObj.num++}${replaceString}`
      }
    }

    node.tag = node.tagName || node.parentNode.tagName || 'p'
    if (!node.children) node.children = [node.value]
    return { tag: node.tag, children: node.children, attrs: src ? { src: src.value } : null }
  })
}

module.exports = { createPage, parse }