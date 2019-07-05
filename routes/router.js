const rateLimit = require("express-rate-limit")
const production = process.env.NODE_ENV == "production"

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

module.exports = (io, path, asyncFs) => {
  router.get("/", (req, res) => {
    res.redirect("/home")
  })

  const index = require("./index.js")
  router.get("/home", index.home)
  router.get("/contact", index.contact)
  router.get("/guestProjects", index.guestProjects)
  router.get("/wolmolen", index.wolmolen)

  const drop = require("./drop.js")(path, asyncFs)
  router.get("/drop", drop.drop)
  router.post("/drop/upload", drop.upload)
  router.get("/drop/:name", drop.get)

  const deletthis = require("./deletthis.js")(asyncFs, path)
  router.get("/deletthis", deletthis.deletthis)
  router.post("/deletthis/upload", deletthis.upload)

  io.on("connection", socket => {
    socket.on("reqNewImg", () => deletthis.reqNewImg(socket))
  })

  return router
}
