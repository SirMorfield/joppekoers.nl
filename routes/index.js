const express = require('express');

// const fs = require('fs');
const path = require('path');
// const home = fs.readFileSync(path.join(__dirname, '../public/contents/home.html'));

let router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index.ejs', {
    title: 'joppekoers.nl',
    mid1: path.join(__dirname, '../public/contents/home.html')
  });
});

module.exports = router;
