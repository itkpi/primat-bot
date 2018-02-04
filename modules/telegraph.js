const { parseFragment, serialize, parse: pparse } = require('parse5'),
      Abstract = require('../models/abstract'),
      User = require('../models/user'),
      currSem = require('../modules/curr-sem'),
      { ph } = require('../modules/utils'),

      getReg = num => new RegExp(`[${num}]`, 'g')


async function createPage(ctx, name, page, photos = []) {
  if (photos.length > 0) {
    const putPhotos = (input, photos) => 
      JSON.parse(photos.reduce((acc, link, indx) => 
        acc.replace(`${indx + 1}${process.env.REPLACE_STRING}`, link), JSON.stringify(input))
      )
    
    page = putPhotos(page, photos)
  }
  const response = await ph.createPage(ctx.session.user.telegraph_token, name, page, { return_content: true })
  
  if (process.env.STATUS === 'prod') {
    const { subject } = ctx.session.cabinet,
          { course, flow, username: author = ctx.from.id } = ctx.session.user,
          semester = currSem(),

          abstract = new Abstract({
            flow,
            name,
            course,
            author,
            subject,
            semester,
            authorId: ctx.from.id,
            telegraph_url: response.url,
            telegraph_path: response.path,
            telegraph_title: response.title
          })

    abstract.save()
  }

  return response
}

function parse(text) {
  const lectureName  = text.substring(0, text.indexOf('\n')) // get first line
        text         = text.substring(text.indexOf('\n') + 1)  // remove first line
  const numObj       = { num: 1 }, // convert will modify it
        parsed       = parseFragment(text),
        page         = convert(numObj)(parsed.childNodes),
        photosAmount = numObj.num - 1

  return { lectureName, page, photosAmount }
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
        node.attrs.find(i => i.name === 'src').value = `${numObj.num++}${process.env.REPLACE_STRING}`
      }
    }

    node.tag = node.tagName || node.parentNode.tagName || 'p'
    if (!node.children) node.children = [node.value]
    return { tag: node.tag, children: node.children, attrs: src ? { src: src.value } : null }
  })
}

module.exports = { createPage, parse }