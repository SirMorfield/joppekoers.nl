let options = {
  title: '',
  home: 'Home',
  contact: 'Contact',
  projects: 'Projects',
  guestProjects: 'Guests\' projects',
  wolmolen: 'Wolmolen',
  softwareProjects: 'Software projects',
  partials: ['partials/home.ejs']
}

if (process.env.NODE_ENV == 'production') options.title = 'Joppe Koers.nl'
else options.title = 'localhost'

exports.home = (req, res) => {
  options.partials = ['partials/home.ejs']
  res.render('index.ejs', options)
}

exports.contact = (req, res) => {
  let contactOptions = options
  contactOptions.partials = ['partials/contact.ejs']
  res.render('index.ejs', contactOptions)
}

exports.projects = (req, res) => {
  let projectsOptions = options
  projectsOptions.partials = ['partials/projects.ejs']
  res.render('index.ejs', projectsOptions)
}

exports.guestProjects = (req, res) => {
  let guestProjectsOptions = options
  guestProjectsOptions.partials = ['partials/guestProjects.ejs']
  res.render('index.ejs', guestProjectsOptions)
}

exports.wolmolen = (req, res) => {
  let wolmolenOptions = options
  wolmolenOptions.partials = ['partials/wolmolen.ejs']
  res.render('index.ejs', wolmolenOptions)
}

exports.softwareProjects = (req, res) => {
  options.partials = ['partials/softwareProjects.ejs']
  res.render('index.ejs', options)
}
