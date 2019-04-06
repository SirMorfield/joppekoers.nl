const getRandomImgName = () => {
  let text = ""
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 16; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text + '.jpg'
}

const isImage = (mimetype) => {
  let isImage = false
  switch (mimetype.trim()) {
    case 'image/jpeg':
      isImage = true
      break
    case 'image/jpg':
      isImage = true
      break
    case 'image/jpeg':
      isImage = true
      break
    case 'image/png':
      isImage = true
      break
    case 'image/gif':
      isImage = true
      break
  }
  return isImage
}

module.exports = (asyncFs, path) => {
  let result = {}

  const getImagePath = (image) => {
    let path1 = '../deletthis/img/'
    if (image) {
      return path.join(path1, image)
    } else {
      return path.join(path1, images[Math.floor(Math.random() * images.length)])
    }
  }

  async function getDirSize() {
    return await asyncFs.readdir(path.join(__dirname, '../public/deletthis/img'))
  }

  let images
  getDirSize().then(r => images = r)

  result.deletthis = (req, res) => {
    res.render('deletthis.ejs', { img: getImagePath() })
  }

  result.upload = (req, res) => {
    try {
      if (!req.files.upfile) {
        res.send("No File selected !")
        return
      }

      if (!isImage(req.files.upfile.mimetype)) {
        res.send('Not an image')
        return
      }

      let savePath = path.join(__dirname, '../public/deletthis/uploaded', getRandomImgName())
      req.files.upfile.mv(savePath, (err) => {
        if (err) {
          console.error(err)
          res.send("Error Occured! 1")
        } else {
          res.send('Done uploading file, it will appear in the pool after review')
        }
      })
    } catch (err) {
      console.error(err)
      res.send('Error Occurred')
    }
  }

  result.reqNewImg = (socket) => {
    socket.emit('resNewImg', getImagePath())
  }

  return result
}
