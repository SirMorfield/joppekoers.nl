const production = process.env.NODE_ENV == 'production'
console.log('NODE_ENV:', process.env.NODE_ENV)
const fs = require('fs')
const http = require('http')
const path = require('path')
const { promisify } = require("util")
const asyncFs = {
  readdir: promisify(fs.readdir),
  unlink: promisify(fs.unlink),
  stat: promisify(fs.stat),
  readFile: promisify(fs.readFile)
}
const express = require('express')
let app = express()
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

const router = require('./routes/router.js')(io, path, asyncFs)
app.use('/', router)

const createError = require('http-errors')
app.use((req, res, next) => next(createError(404)))

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = production ? {} : err
  res.status(err.status || 500)
  if (!production) console.log(err)
  res.render('./error.ejs')
})

httpServer.listen(8080, () => { })
