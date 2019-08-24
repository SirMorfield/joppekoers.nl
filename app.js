(async () => {
  const production = process.env.NODE_ENV == 'production'
  const path = require('path')

  const express = require('express')
  let app = express()

  const http = require('http')
  const httpServer = http.createServer(app)
  let io = require('socket.io')(httpServer)
  app.enable('trust proxy')

  const compression = require('compression')
  app.use(compression({ level: 9 }))

  const fileUpload = require('express-fileupload')
  app.use(fileUpload({
    limits: { fileSize: 3.221e9 }, // 3 GiB
    abortOnLimit: true
  }))

  const favicon = require('serve-favicon')
  app.use(favicon(path.join(__dirname, 'public/logo/favicon.ico')))

  app.set('views', path.join(__dirname, 'views/'))
  app.set('view engine', 'ejs')

  app.use(express.urlencoded({ extended: false }))
  app.use(express.static(path.join(__dirname, 'public/')))

  const db = await require('./server/db/db.js')()

  const router = require('./routes/router.js')(io, db)
  app.use('/', router)

  httpServer.listen(8080, () => {
    console.clear()
    console.log('NODE_ENV:', process.env.NODE_ENV)
  })
})()
