(async () => {
  const io = require('socket.io-client');
  const low = require('lowdb')
  const FileAsync = require('lowdb/adapters/FileAsync')
  const adapter = new FileAsync('stations.json',
    {
      serialize: (array) => JSON.stringify(array),
      deserialize: (string) => JSON.parse(string)
    })
  const db = await low(adapter)

  const stations = [
    { name: "100p-nl", id: 46 },
    { name: "qmusic", id: 68 },
    { name: "radio-10", id: 66 },
    { name: "radio-2", id: 220 },
    { name: "radio-3fm", id: 69 },
    { name: "radio-538", id: 67 },
    { name: "radio-veronica", id: 120 },
    { name: "sky-radio", id: 117 },
    { name: "slam", id: 82 },
    { name: "sublime-fm", id: 182 },
    { name: "arrow-classic-rock", id: 223 }
  ]

  let defaults = {}
  stations.forEach(station => {
    defaults[station.name] = []
  })
  await db.defaults(defaults).write()

  async function saveSong(song, station) {
    const latest = await db.get(station).last().value()
    if (latest) {
      if (latest.name === song.name) return
    }

    await db.get(station).push(song).write()
  }

  stations.forEach(station => {
    let socket = io.connect('https://nowplaying.radiozenders.fm:8080', {
      secure: true,
      extraHeaders: {
        Origin: 'https://www.radiozenders.fm'
      }
    })

    socket.emit('getInfo', { id: station.id })

    socket.on('streaminfo', (data) => {
      const info = data.split(' - ')
      const song = {
        name: info[1],
        artist: info[0],
        dates: [Date.now()],
      }
      saveSong(song, station.name)
    })
  })
  console.log('started app')
})()
