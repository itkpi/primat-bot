const { parseFragment } = require('parse5'),
      Abstract = require('../models/abstract'),
      User = require('../models/user'),
      getReg = num => new RegExp(`{{[${num}]}}`, 'g'),
      replaceString = process.env.REPLACE_STRING

async function createPage(bot, ph, ctx, name, page, photos = []) {
  const date      = new Date(),
        month     = date.getMonth() + 1,
        semester  = month > 7 && month <= 12 ? 1 : 2

  if (photos.length > 0) {
    page = JSON.stringify(page)
    photos.forEach((link, indx) => page = page.replace(`${indx + 1}${replaceString}`, link))
    page = JSON.parse(page)
    console.log(page)
  }

  const response = await ph.createPage(ctx.session.user.telegraph_token, name, page, { return_content: true }),
        { subject } = ctx.session.cabinet,
        { course, flow, username: author } = ctx.session.user,
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
  const msg = `${abstract.author} сохранил лекцию по предмету ${abstract.subject}\n${abstract.telegraph_url}\n` + 
              `(/unsub чтобы отписаться)`,
        users = await User.find({ flow, course })
  users.forEach(user => 
    user.tgId !== abstract.authorId && !user.unsubscriber 
      ? bot.telegram.sendMessage(user.tgId, msg) : null
  )

  return response
}

function parse(text) {
  const lectureName  = text.substring(0, text.indexOf('\n')) // get first line
        text         = text.substring(text.indexOf('\n') + 1)  // remove first line
  const numObj       = { num: 1 }, // convert will modify it
        page         = convert(numObj)(parseFragment(text).childNodes),
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
        node.attrs.find(i => i.name === 'src').value = `${numObj.num++}${replaceString}`
      }
    }

    node.tag = node.tagName || node.parentNode.tagName || 'p'
    if (!node.children) node.children = [node.value]
    return { tag: node.tag, children: node.children, attrs: src ? { src: src.value } : null }
  })
}

module.exports = { createPage, parse }