const rateLimit = require('express-rate-limit')
const production = process.env.NODE_ENV == 'production'
const path = require('path')
const fs = require('fs').promises
const env = require('../configs/env.json')

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


  const startserver3 = require('./startserver3.js')
  router.get('/startserver3', startserver3.route)

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
    socket.on('startServer3', (inp) => startserver3.startserver3(socket, inp))
  })

  return router
}
