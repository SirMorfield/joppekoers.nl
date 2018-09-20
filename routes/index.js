const express = require('express');
let router = express.Router();

router.get('/:location', (req, res, next) => {
  let data = {
    title: 'joppekoers.nl',
    menu: 'Home page info'
  }
  res.render('index.ejs', data);
});

module.exports = router;
