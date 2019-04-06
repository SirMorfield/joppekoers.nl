const mime = require('mime-types')
const disk = require('diskusage')

function randomStr(length, { numbers = true, capitalLetters = true, lowerCaseLetters = true }) {
  let text = ''
  let possible = ''
  if (numbers) possible += '1234567890'
  if (capitalLetters) possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lowerCaseLetters) possible += 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

module.exports = (path, asyncFs) => {
  const filesDir = path.join(__dirname, '../public/drop/files')

  function drop(req, res) {
    res.render('drop.ejs')
  }

  async function upload(req, res) {
    const file = req.files.upfile
    if (!file) {
      res.send("No File selected !")
      return
    }

    const name = randomStr(3, { capitalLetters: false, lowerCaseLetters: false })
    const fileName = name + '.' + mime.extension(file.mimetype)
    const savePath = path.join(filesDir, fileName)

    const free = await disk.check('/')
    if (free < 4.295e10) { // 40 GiB
      const files = await asyncFs.readdir(filesDir)

      let oldest = { file: 'testfile123', birthtimeMs: Infinity }
      for (const file of files) {
        let stats = await asyncFs.stat(path.join(filesDir, file))
        if (stats.birthtimeMs < oldest.birthtimeMs) oldest = { file, birthtimeMs: stats.birthtimeMs }
      }

      if (oldest.file !== 'testfile123') {
        await asyncFs.unlink(path.join(filesDir, oldest.file))
      }
    }

    file.mv(savePath, (err) => {
      if (err) {
        console.error(err)
        return res.send("Error Occured!")
      } else {
        return res.send(`DONE, go to joppekoers.nl/drop/${name} to download it`)
      }
    })
  }

  async function get(req, res) {
    const files = await asyncFs.readdir(filesDir)
    const file = files.find(file => file.includes(req.params.name))
    if (!file) return res.send('Not found')
    res.download(path.join(filesDir, file))
  }

  return {
    drop,
    upload,
    get
  }
}
