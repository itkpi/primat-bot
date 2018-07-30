const config = require('config')
const mathmode = require('mathmode')
const { parseFragment } = require('parse5')
const picasa = require('../../modules/picasa')
const telegraph = require('../../modules/telegraph')
const User = require('../../db/models/user')
const Abstract = require('../../db/models/abstract')
const univerService = require('./univer')

const getReg = num => new RegExp(`[${num}]`, 'g')

const convert = info => nodes => nodes.map(node => {
  if (node.value && node.value.trim() === '') return false
  if (node.childNodes) {
    node.children = convert(info)(node.childNodes)
  }
  let src
  if (node.tagName === 'img') {
    const reg = getReg(info.photosAmount)
    src = node.attrs.find(i => i.name === 'src')
    if (src && src.value.match(reg)) {
      src.value = `${info.photosAmount}${process.env.REPLACE_STRING}`
      info.photosAmount += 1
    }
  }
  if (node.tagName === 'l') {
    const [target] = node.childNodes
    const value = target.value.trim()
    if (value) {
      node.tagName = 'img'
      const attr = {
        name: 'src',
        value: `${info.latexExpressions.length}latex${process.env.REPLACE_STRING}`,
      }
      node.attrs.push(attr)
      src = attr
      info.latexExpressions.push(value)
    }
  }
  node.tag = node.tagName || node.parentNode.tagName || 'p'
  if (!node.children) {
    node.children = [node.value]
  }
  return {
    tag: node.tag,
    children: node.children,
    attrs: src ? { src: src.value } : null,
  }
})

function uploadPhotos(binariesGenTasks, user, pageData) {
  const { course, username, tgId } = user
  const { subject, lectureName, picasaToken } = pageData
  const summary = `${lectureName}. Created by ${username || tgId}.`
  const getTitle = num => `Formula #${num}. ${course} course. ${subject} | ${new Date().toDateString()}`
  const upload = (binaryUploadTask, num) => binaryUploadTask.then(
    binary => new Promise((resolve, reject) => picasa.postPhoto(
      picasaToken,
      config.picasaAlbumId,
      {
        title: getTitle(num + 1),
        contentType: 'image/jpg',
        summary,
        binary,
      },
      (err, { content }) => err ? reject(err) : resolve(content.src),
    )),
  )
  return Promise.all(binariesGenTasks.map(upload))
}

function insertPhotoLinks(page, photoLinks = [], latexPhotoLinks = []) {
  if (photoLinks.length > 0 || latexPhotoLinks.length > 0) {
    let src = JSON.stringify(page)
    photoLinks.forEach((link, indx) => {
      src = src.replace(`${indx + 1}${process.env.REPLACE_STRING}`, link)
    })
    latexPhotoLinks.forEach((link, indx) => {
      src = src.replace(`${indx}latex${process.env.REPLACE_STRING}`, link)
    })
    return JSON.parse(src)
  }
  return page
}

module.exports = {
  parse(text) {
    const lectureName = text.slice(0, text.indexOf('\n'))
    text = text.substring(text.indexOf('\n') + 1) // remove first line
    const info = { photosAmount: 0, latexExpressions: [] }
    const page = convert(info)(parseFragment(text).childNodes)
    return {
      lectureName,
      page,
      photosAmount: info.photosAmount,
      latexExpressions: info.latexExpressions,
    }
  },
  getPhotosFromLatex(user, pageData) {
    const binariesGenTasks = pageData.latexExpressions.map(
      expression => new Promise((resolve, reject) => {
        const render = mathmode(expression)
        const bufs = []
        render.on('data', data => bufs.push(data))
        render.on('error', reject)
        render.on('finish', () => resolve(Buffer.concat(bufs)))
      }),
    )
    return uploadPhotos(binariesGenTasks, user, pageData)
  },
  async createTelegraphPage(tgId, data) {
    data.page = insertPhotoLinks(data.page, data.photoLinks, data.latexPhotoLinks)
    // console.dir(data, {depth: 100})
    const { telegraph: { accessToken }, flow, course } = await User.findOne({ tgId })
    const ops = { return_content: true }
    const telegraphPage = await telegraph.createPage(accessToken, data.name, data.page, ops)
    // console.dir(telegraphPage, { depth: 100 })
    const abstract = new Abstract({
      flow,
      course,
      subject: data.subject,
      semester: await univerService.getCurrSemester(),
      authorId: tgId,
      name: '',
      url: telegraphPage.url,
      path: telegraphPage.path,
      title: telegraphPage.title,
    })
    return abstract.save()
  },
  getPicasaAccessToken() {
    return new Promise((resolve, reject) => {
      const params = {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      }
      picasa.renewAccessToken(params, config.picasaRefreshToken,
        (err, token) => err ? reject(err) : resolve(token))
    })
  },
}
