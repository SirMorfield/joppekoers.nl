const rateLimit = require("express-rate-limit")
const production = process.env.NODE_ENV == "production"
const path = require('path')
const fs = require('fs')

function limiter(max, mins) {
  // max requests per minute for this route
  let limiter = rateLimit({
    windowMs: mins * 60 * 1000,
    max,
    message: `Too many request, try again in about ${mins} minutes`
  })
  return production ? limiter : (req, res, next) => next()
}

const express = require("express")
let router = express.Router()

module.exports = (io, db) => {
  router.get("/", (req, res) => {
    res.redirect("/home")
  })

  const index = require("./index.js")
  router.get("/home", index.home)
  router.get("/contact", index.contact)
  router.get("/guestProjects", index.guestProjects)

  const wolmolen = require('./wolmolen.js')(db, index.standardOptions)
  router.get("/wolmolen", wolmolen.route)

  const drop = require("./drop.js")(path, fs)
  router.get("/drop", drop.drop)
  router.post("/drop/upload", drop.upload)
  router.get("/drop/:name", drop.get)

  router.get('*', (req, res) => {
    const options = {
      error: {
        code: 404,
        message: 'Not found'
      }
    }
    res.render('error.ejs', options)
  })

  io.on("connection", socket => {
  })

  return router
}
