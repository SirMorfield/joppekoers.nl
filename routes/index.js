const express = require('express');

const fs = require('fs');
const path = require('path');
const home = fs.readFileSync(path.join(__dirname, '../public/views/partials/home.ejs'));

let router = express.Router();

router.get('/:language/:page', (req, res, next) => {
  let language = req.params.language;
  let page = req.params.page;

  let options = {

  }

  res.render('index.ejs', {
    title: 'joppekoers.nl',
    mid1: home
  });
});

module.exports = router;
