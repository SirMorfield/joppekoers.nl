const rateLimit = require("express-rate-limit");
const production = process.env.NODE_ENV == 'production'

function limiter(max, mins) { // max requests per miniut for this route
  let limiter = rateLimit({
    windowMs: mins * 60 * 1000,
    max,
    message: `Too many request, try again in about ${mins} minutes`
  })
  return production ? limiter : (req, res, next) => { next() }
}

const express = require('express')
let router = express.Router()

module.exports = (io, path, asyncFs) => {
  router.get('/', (req, res) => {
    res.redirect('/home')
  })

  const index = require('./index.js')
  router.get('/home', (req, res) => {
    index.home(req, res)
  })
  router.get('/contact', (req, res) => {
    index.contact(req, res)
  })
  router.get('/projects', (req, res) => {
    index.projects(req, res)
  })
  router.get('/guestProjects', (req, res) => {
    index.guestProjects(req, res)
  })
  router.get('/wolmolen', (req, res) => {
    index.wolmolen(req, res)
  })
  router.get('/softwareProjects', (req, res) => {
    index.softwareProjects(req, res)
  })

  const drop = require('./drop.js')(path, asyncFs)
  router.get('/drop', (req, res) => {
    drop.drop(req, res)
  })
  router.post('/drop/upload', async (req, res) => {
    drop.upload(req, res)
  })
  router.get('/drop/:name', (req, res) => {
    drop.get(req, res)
  })

  const deletthis = require('./deletthis.js')(asyncFs, path)
  router.get('/deletthis', (req, res) => {
    deletthis.deletthis(req, res)
  })
  router.post('/deletthis/upload', (req, res) => {
    deletthis.upload(req, res)
  })

  const mcServer = require('./mcServer.js')
  router.get('/mcServer', limiter(100, 5), (req, res) => {
    mcServer.mcServer(req, res)
  })

  io.on('connection', (socket) => {
    socket.on('reqNewImg', () => {
      deletthis.reqNewImg(socket)
    })

    socket.on('startServer', () => {
      mcServer.startServer(socket)
    })
  })

  return router
}
