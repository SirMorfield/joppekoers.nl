const path = require('path')
const request = require('request-promise-native')

const wol = require(path.join(process.env.root, 'server/node-wol.js'))
const env = require(path.join(process.env.root, 'configs/env.json'))
let services = env.server3.services

async function isUp(serviceName) {
  try {
    let service = services.find((service) => service.name == serviceName)
    let response = await request({ url: service.url })
    return response ? true : false
  } catch (err) {
    return false
  }
}

async function redirectWhenUp(socket, serviceName) {
  const online = await isUp(serviceName)
  if (online) return socket.emit('redirect', `https://${serviceName}.joppekoers.nl`)
  socket.emit('message', `.`)
  setTimeout(() => redirectWhenUp(socket, serviceName), 300)
}

async function server3(socket, serviceName) {
  if (serviceName) serviceName = serviceName.replace(/[^A-Za-z]/g, '')

  if (serviceName == 'server3' || !services.find((service) => service.name == serviceName)) {
    socket.emit('message', 'server3 suspended, sending Magic Packet... <br>')

    const wake = await wol.wake(env.server3.macAddress)
    if (wake.exitCode !== 0) {
      return socket.emit('message', 'Sending magic packet failed, can\'t start server. <br>')
    }

    socket.emit('message', 'No valid service for redirect specified, waiting. <br>')
    return
  }

  socket.emit('message', `Checking if service \"${serviceName}\" is up. <br>`)
  const online = await isUp(serviceName)
  if (online) return socket.emit('redirect', `https://${serviceName}.joppekoers.nl`)
  socket.emit('message', `Can\'t reach service \"${serviceName}\", server3 suspended. <br>`)

  socket.emit('message', `sending Magic Packet... <br>`)
  const wake = await wol.wake(env.server3.macAddress)
  if (wake.exitCode !== 0) {
    return socket.emit('message', 'Sending magic packet failed, can\'t start server. <br>')
  }
  socket.emit('message', `Magic packet send, waiting for ${serviceName} to start. <br>`)

  await redirectWhenUp(socket)
}

function route(req, res) {
  res.render('server3.ejs')
}

module.exports = { route, server3 }
