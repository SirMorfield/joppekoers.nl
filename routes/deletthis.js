const express = require('express');
const path = require('path');
const fs = require('fs');

const getRandomImgName = () => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text + '.jpg';
}

let router = express.Router();

const getDirSize = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, '../public/deletthis/img'), (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  })
}

let images;
getDirSize().then(r => images = r);

const getRandomImgPath = () => {
  return '../deletthis/img/' + images[Math.floor(Math.random() * images.length)];
}

const isImage = (mimetype) => {
  mimetype = mimetype.trim();
  if (mimetype == 'image/jpeg') return true
  if (mimetype == 'image/jpg') return true
  if (mimetype == 'image/png') return true
  return false;
}

router.post('/upload', function (req, res) {
  try {
    console.log(req.files.upfile.mimetype);

    if (!req.files.upfile) {
      res.send("No File selected !");
      return;
    }

    if (!isImage(req.files.upfile.mimetype)) {
      res.send('Not an image')
      return;
    }

    let savePath = path.join(__dirname, '../public/deletthis/uploaded', getRandomImgName())
    req.files.upfile.mv(savePath, function (err) {
      if (err) {
        res.send("Error Occured!");
      }
      else {
        res.send('Done uploading files');
      }
    });
  } catch (err) {
    console.error(err);
    res.send('error occurred;');
  }
});

router.get('/', (req, res) => {
  let img = '<img src\"' + getRandomImgPath() + '\" id="img">'
  res.render('deletthis.ejs', { img: img });

  const io = req.app.get('socketio');
  io.on('connection', socket => {
    io.removeAllListeners('connection');

    socket.on('reqNewImg', function () {
      socket.emit('resNewImg', getRandomImgPath());
    })

  });
})

module.exports = router;
