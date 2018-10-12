const express = require('express');
const path = require('path');
const fs = require('fs');
const getRandomStr = () => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
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


router.get('/', (req, res) => {
  var io = req.app.get('socketio');
  let img = '<img src\"' + getRandomImgPath() + '\" id="img">'
  res.render('deletthis.ejs', { img: img });
  io.on('connection', socket => {
    socket.on('reqNewImg', function () {
      socket.emit('resNewImg', getRandomImgPath());
    })
  });
  // console.log(img);
})

module.exports = router;
