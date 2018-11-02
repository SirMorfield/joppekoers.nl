const path = require('path');
const express = require('express');
const fs = require('fs')
let router = express.Router();

module.exports = io => {
  const getRandomImgName = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text + '.jpg';
  };

  const getDirSize = () => {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(__dirname, '../public/deletthis/img'), (err, files) => {
        if (err) reject(err);
        resolve(files);
      });
    })
  };

  const renameAllImages = () => {
    getDirSize().then(r => {
      r.forEach(img => {
        fs.rename(path.join(__dirname, '../public/deletthis/img', img), path.join(__dirname, '../public/deletthis/img', getRandomImgName()), (err) => { if (err) console.error(err) });
      });
    });
  };

  // setTimeout(() => {
  //   renameAllImages();
  // }, 10000);

  let images;
  getDirSize().then(r => images = r);

  const getRandomImgPath = () => '../deletthis/img/' + images[Math.floor(Math.random() * images.length)];

  const isImage = (mimetype) => {
    let isImage = false;
    switch (mimetype.trim()) {
      case 'image/jpeg':
        isImage = true;
        break;
      case 'image/jpg':
        isImage = true;
        break;
      case 'image/jpeg':
        isImage = true;
        break;
      case 'image/png':
        isImage = true;
        break;
      case 'image/gif':
        isImage = true;
        break;
    }
    return isImage;
  }

  io.on('connection', socket => {
    socket.on('reqNewImg', () => {
      socket.emit('resNewImg', getRandomImgPath());
    });
  });

  router.post('/upload', function (req, res) {
    try {
      if (!req.files.upfile) {
        res.send("No File selected !");
        return;
      }

      if (!isImage(req.files.upfile.mimetype)) {
        res.send('Not an image')
        return;
      }

      let savePath = path.join(__dirname, '../public/deletthis/uploaded', getRandomImgName());
      req.files.upfile.mv(savePath, function (err) {
        if (err) {
          console.error(err);
          res.send("Error Occured!");
        } else {
          res.send('Done uploading file, it will appear in the pool after review');
        }
      });
    } catch (err) {
      console.error(err);
      res.send('Error Occurred');
    }
  });

  router.get('/', (req, res) => {
    res.render('deletthis.ejs', { img: getRandomImgPath() });
  });

  return router;
}
