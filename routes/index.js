const express = require('express');

const fs = require('fs');
const path = require('path');
const home = fs.readFileSync(path.join(__dirname, '../public/views/partials/home.ejs'));

let router = express.Router();

router.get('/:language/:page', (req, res, next) => {
  let language = req.params.language;
  let page = req.params.page;
  let options;

  switch (language) {
    // case 'nl':

    //   break;

    default:
      options = {
        home: 'Home',
        projects: 'projects',
        guestProjects: 'guestProjects',
        wolmolen: 'wolmolen',
        ictIndeWolken: 'ictInDeWolken',
        mid1: home
      }
      break;
  }


  res.render('index.ejs', options);
});

module.exports = router;
