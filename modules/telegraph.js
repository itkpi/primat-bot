const { parseFragment } = require('parse5'),
      Abstract = require('../models/abstract'),
      currSem = require('../modules/curr-sem'),
      { ph } = require('../modules/utils'),

      getReg = num => new RegExp(`[${num}]`, 'g')


async function createPage(ctx, name, page, links) {
  const {
    photoPicasaLinks = [],
    latexPicasaLinks = []
  } = links

  if (photoPicasaLinks.length > 0 || latexPicasaLinks.length > 0) {
    let src = JSON.stringify(page)

    photoPicasaLinks.forEach((link, indx) => {
      src = src.replace(`${indx + 1}${process.env.REPLACE_STRING}`, link)
    })

    latexPicasaLinks.forEach((link, indx) => {
      src = src.replace(`${indx}latex${process.env.REPLACE_STRING}`, link)
    })

    page = JSON.parse(src)
  }

  const response = await ph.createPage(ctx.session.user.telegraph_token, name, page, { return_content: true })

  if (process.env.STATUS === 'prod') {
    const { subject } = ctx.session.cabinet,
          { course, flow, username: author = ctx.from.id } = ctx.session.user,

          abstract = new Abstract({
            flow,
            name,
            course,
            author,
            subject,
            semester: currSem(),
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
  const lectureName = text.substring(0, text.indexOf('\n')) // get first line
  text = text.substring(text.indexOf('\n') + 1) // remove first line
  const info = { photoNum: 1, latexValues: [] }, // convert will modify it
        parsed = parseFragment(text),
        page = convert(info)(parsed.childNodes),
        photosAmount = info.photoNum - 1
  console.log(page)
  return { lectureName, page, photosAmount, latexValues: info.latexValues }
}

function convert(info) {
  return nodes => nodes.map(node => {
    if (node.value && node.value.trim() == '') return
    if (node.childNodes) {
      node.children = convert(info)(node.childNodes)
    }
    let src
    if (node.tagName === 'img') {
      const reg = getReg(info.photoNum)
      src = node.attrs.find(i => i.name === 'src')

      if (src.value.match(reg)) {
        src.value = `${info.photoNum++}${process.env.REPLACE_STRING}`
      }
    }

    if (node.tagName === 'l') {
      const [target] = node.childNodes
      const value = target.value.trim()
      if (value) {
        node.tagName = 'img'
        const attr = { name: 'src', value: `${info.latexValues.length}latex${process.env.REPLACE_STRING}` }
        node.attrs.push(attr)
        src = attr
        info.latexValues.push(value)
      }
    }

    node.tag = node.tagName || node.parentNode.tagName || 'p'
    if (!node.children) node.children = [node.value]
    return { tag: node.tag, children: node.children, attrs: src ? { src: src.value } : null }
  })
}

module.exports = { createPage, parse }
