(async () => {
	const path = require('path')
	const isProduction = process.env['NODE_ENV'] == 'production'
	process.env['root'] = path.join(__dirname, '../')
	process.env['srcRoot'] = __dirname

	const express = require('express')
	let app = express()

	const http = require('http')
	const httpServer = http.createServer(app)
	// let io = require('socket.io')(httpServer)
	app.enable('trust proxy')

	const compression = require('compression')
	app.use(compression({ level: 9 }))

	const favicon = require('serve-favicon')
	app.use(favicon(path.join(process.env['root'], 'public/logo/favicon.ico')))

	app.set('views', path.join(process.env['root'], 'views/'))
	app.set('view engine', 'ejs')

	app.use(express.urlencoded({ extended: false }))
	app.use(express.json())
	app.use(express.static(path.join(process.env['root'], 'public/')))

	const title = isProduction ? 'Joppe Koers.nl' : 'localhost'
	const home = require('./routes/home')(title)
	const contact = require('./routes/contact')(title)
	// const wolmolen = require('./routes/wolmolen')(title, db)
	// const code = require('./routes/code')(title)
	const drop = require('./routes/drop')
	const error = require('./routes/error')(title)

	app.get('/', home)
	app.get('/home', home)
	app.get('/contact', contact)
	// app.get('/wolmolen', wolmolen)
	// app.get('/code', code)

	app.get('/drop', drop.drop)
	app.post('/drop/upload', drop.upload)
	app.get('/drop/:identifier', drop.download)

	app.get('*', error)

	httpServer.listen(8080, () => {
		// console.clear()
		console.log('NODE_ENV:', process.env['NODE_ENV'])
	})
})()
