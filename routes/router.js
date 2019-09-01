const rateLimit = require('express-rate-limit')
const production = process.env.NODE_ENV == 'production'
const path = require('path')

function limiter(max, mins) {
  // max requests per minute for this route
  let limiter = rateLimit({
    windowMs: mins * 60 * 1000,
    max,
    message: `Too many requests, try again in about ${mins} minutes`
  })
  return production ? limiter : (req, res, next) => next()
}

const express = require('express')
let router = express.Router()

module.exports = (io, db) => {
  const index = require('./index.js')
  router.get('/', index.home)
  router.get('/home', index.home)
  router.get('/contact', index.contact)
  router.get('/guestProjects', index.guestProjects)

  const wolmolen = require('./wolmolen.js')(db, index.standardOptions)
  router.get('/wolmolen', wolmolen.route)

  const checkout = require('./checkout.js')(db, index.standardOptions)
  router.get('/checkout', checkout.route)

  // const drop = require('./drop.js')()
  // router.get('/drop', drop.drop)
  // router.post('/drop/upload', drop.upload)
  // router.get('/drop/:name', drop.get)


  const server3 = require('./server3.js')
  router.get('/server3(/:service|)', server3.route)

  // page not found error handling
  router.get('*', (req, res) => {
    const options = {
      errorCode: 404,
      errorMessage: 'Not found'
    }
    res.render('error.ejs', options)
  })

  io.on('connection', socket => {
    socket.on('validateContact', (inp) => checkout.validateContact(socket, inp))
    socket.on('server3', (inp) => server3.server3(socket, inp))
  })

  return router
}
