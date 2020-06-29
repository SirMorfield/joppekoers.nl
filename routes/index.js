let options = {
	title: process.env.NODE_ENV == 'production' ? 'Joppe Koers.nl' : 'localhost',
	home: 'Home',
	contact: 'Contact',
	guestProjects: 'Guests\' projects',
	wolmolen: 'Wolmolen',
	partials: [],
	partialOptions: {}
}

exports.home = (req, res) => {
	let home = options
	home.partials = ['partials/home.ejs']
	res.render('index.ejs', home)
}

exports.contact = (req, res) => {
	let contact = options
	contact.partials = ['partials/contact.ejs']
	res.render('index.ejs', contact)
}

exports.guestProjects = (req, res) => {
	let guestProjects = options
	guestProjects.partials = ['partials/guestProjects.ejs']
	res.render('index.ejs', guestProjects)
}

exports.standardOptions = options
