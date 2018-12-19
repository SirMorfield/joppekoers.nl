const express = require('express');
let router = express.Router();

let options = {
  title: '',
  home: 'Home',
  projects: 'Projects',
  guestProjects: 'Guests\' projects',
  wolmolen: 'Wolmolen',
  softwareProjects: 'Software projects',
  partials: ['partials/home.ejs']
};

if (process.env.NODE_ENV == 'production') options.title = 'Joppe Koers.nl'
else options.title = 'localhost'

router.get('/', (req, res, next) => {
  res.redirect('/home');
});

router.get('/home', (req, res) => {
  options.partials = ['partials/home.ejs']
  res.render('index.ejs', options);
});

router.get('/projects', (req, res) => {
  options.partials = ['partials/projects.ejs']
  res.render('index.ejs', options);
});

router.get('/softwareProjects', (req, res) => {
  options.partials = ['partials/softwareProjects.ejs']
  res.render('index.ejs', options);
});

module.exports = router;
