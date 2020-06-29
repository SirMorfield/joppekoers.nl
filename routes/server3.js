const path = require('path')
const request = require('request-promise-native')

const wol = require(path.join(process.env.root, 'server/node-wol.js'))
const env = require(path.join(process.env.root, 'configs/env.json'))
let services = env.server3.services
let pings = 0

async function isUp(serviceName) {
  try {
    let service = services.find((service) => service.name == serviceName)
    let response = await request({
      url: service.url,
      timeout: 2000
    })
    return response ? true : false
  } catch (err) {
    return false
  }
}

async function redirectWhenUp(socket, serviceName) {
  const online = await isUp(serviceName)
  if (online) {
    socket.emit('redirect', `https://${serviceName}.joppekoers.nl`)
    return
  }
  socket.emit('message', `.`)
  pings++
  if (pings < 600) { // only ping for ~4.0 min
    setTimeout(() => redirectWhenUp(socket, serviceName), 400)
  }
}

async function sendMagicPacket(socket, serviceName) {
  socket.emit('message', `Sending Magic Packet... <br>`)
  const wake = await wol.wake(env.server3.macAddress)
  if (wake.exitCode !== 0) {
    socket.emit('message', 'Sending magic packet failed, can\'t start server. <br>')
    return wake.exitCode
  }
  socket.emit('message', `Done. <br>`)
  socket.emit('message', `Waiting for \"${serviceName}\" to start. <br>`)

  return 0
}

async function server3(socket, serviceName) {
  if (serviceName) serviceName = serviceName.replace(/[^A-Za-z]/g, '')

  if (serviceName == 'server3' || !services.find((service) => service.name == serviceName)) {
    socket.emit('message', 'server3 suspended <br>')

    const exitCode = await sendMagicPacket(socket, serviceName)
    if (exitCode !== 0) return
    socket.emit('message', 'No valid service for redirect specified, waiting. <br>')
    return
  }

  socket.emit('message', `Checking if service \"${serviceName}\" is up. <br>`)

  let progress = setInterval(() => socket.emit('message', `.`), 400)
  const online = await isUp(serviceName)
  clearInterval(progress)
  socket.emit('message', `Done.<br>`)

  if (online) {
    socket.emit('redirect', `https://${serviceName}.joppekoers.nl`)
    return
  }
  socket.emit('message', `Can\'t reach service \"${serviceName}\", server3 suspended. <br>`)

  const exitCode = await sendMagicPacket(socket, serviceName)
  if (exitCode == 0) {
    pings = 0
    await redirectWhenUp(socket, serviceName)
  }
}

function route(req, res) {
  res.render('server3.ejs')
}

module.exports = { route, server3 }
