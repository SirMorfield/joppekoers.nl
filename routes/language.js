const express = require('express');
const path = require('path');

let router = express.Router();
router.get('/', (req, res) => {
  res.render(path.join(__dirname, '../public/views/language.ejs'));
})
module.exports = router;
