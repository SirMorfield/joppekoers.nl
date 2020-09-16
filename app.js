(async () => {
	const production = process.env.NODE_ENV == 'production'
	process.env.root = __dirname
	const path = require('path')

	const express = require('express')
	let app = express()

	const http = require('http')
	const httpServer = http.createServer(app)
	let io = require('socket.io')(httpServer)
	app.enable('trust proxy')

	const fileUpload = require('express-fileupload')
	app.use(fileUpload({
		limits: { fileSize: 10.221e9 }, // 10 GiB
		abortOnLimit: true,
		useTempFiles: true,
		tempFileDir: '/tmp/'
	}))

	const favicon = require('serve-favicon')
	app.use(favicon(path.join(__dirname, 'public/logo/favicon.ico')))

	app.set('views', path.join(__dirname, 'views/'))
	app.set('view engine', 'ejs')

	app.use(express.urlencoded({ extended: false }))
	app.use(express.json())
	app.use(express.static(path.join(__dirname, 'public/')))

	const db = await require('./server/db/db.js')()
	const title = process.env.NODE_ENV == 'production' ? 'Joppe Koers.nl' : 'localhost'

	const home = require('./routes/home.js')(title)
	const contact = require('./routes/contact.js')(title)
	// const wolmolen = require('./routes/wolmolen.js')(title, db)
	// const code = require('./routes/code.js')(title)
	const error = require('./routes/error.js')(title)
	const drop = require('./routes/drop.js')

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
		console.clear()
		console.log('NODE_ENV:', process.env.NODE_ENV)
	})
})()
