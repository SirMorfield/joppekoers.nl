const express = require("express")
const http = require('http')
const path = require('path')
const wol = require(path.join(process.env.root, 'server/node-wol.js'))
let router = express.Router()

function isUp() {
  return new Promise((resolve) => {
    var options = {
      host: env.server3.address,
      port: env.server3.plexPort
    }

    http.get(options, (res) => {
      if (res.statusCode == 200) {
        console.log("success")
        resolve(true)
      }
    }).on('error', (e) => {
      console.log("Got error: " + e.message)
      resolve(false)
    })
  })
}

async function startserver3(socket) {
  const online = await isUp()
  if (online) {
    socket.emit('server3message', 'Plex server running, redirecting... <br>')
    setTimeout(() => {
      socket.emit('redirectToPlex')
    }, 100)
  }
  socket.emit('server3message', 'Plex server suspended, sending Magic Packet <br>')

  const wake = await wol.wake(env.server3.macAddress)
  if (wake.exitCode !== 0) {
    socket.emit('server3message', 'Sending magic packet failed, can\'t start server <br>')
  }

  socket.emit('server3message', 'Magic packet send, waiting for Plex to start <br>')
  let interval = setInterval(async () => {
    const online = await isUp()
    if (online) {
      socket.emit('server3message', 'Plex Server started, redirecting... <br>')
      setTimeout(() => {
        socket.emit('redirectToPlex')
      }, 100)
      clearInterval(interval)
    }
  }, 2000)
}

router.get("/", (req, res) => {
  res.render('startserver3.ejs')
})

module.exports = router
