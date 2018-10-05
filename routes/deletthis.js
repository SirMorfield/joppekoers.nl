const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router();

const getDirSize = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, '../server/deletthis/img'), (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  })
}
let images;
getDirSize().then(r => images = r);

setInterval(() => {
  getDirSize().then(r => images = r);
}, 1000 * 60 * 60 * 24); //once a day

router.get('/', (req, res) => {
  let img = images[Math.floor(Math.random() * images.length)];
  res.sendFile(path.join(__dirname, '../server/deletthis/img', img))
  // console.log(img);
})

module.exports = router;
