const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index.ejs', { title: 'joppekoers.nl' });
});

module.exports = router;
