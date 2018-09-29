const express = require('express');

const fs = require('fs');
const path = require('path');
const home = fs.readFileSync(path.join(__dirname, '../views/partials/home.ejs'));
const projects = fs.readFileSync(path.join(__dirname, '../views/partials/projects.ejs'));
let router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('/home');
});

router.get('/home', (req, res) => {
  let options = {
    title: 'Joppe Koers.nl',
    home: 'Home',
    projects: 'projects',
    guestProjects: 'guestProjects',
    wolmolen: 'wolmolen',
    ictInDeWolken: 'ictInDeWolken',
    mid1: home
  }
  res.render('index.ejs', options);
});

router.get('/projects', (req, res) => {
  let options = {
    title: 'Joppe Koers.nl',
    home: 'Home',
    projects: 'projects',
    guestProjects: 'guestProjects',
    wolmolen: 'wolmolen',
    ictInDeWolken: 'ictInDeWolken',
    mid1: projects
  }
  res.render('index.ejs', options);
});

module.exports = router;
