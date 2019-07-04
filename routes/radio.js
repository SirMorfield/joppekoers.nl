module.exports = (asyncFs, path) => {
  let exp = {}
  exp.root = async (req, res) => {
    let stations = await asyncFs.readFile(path.join(__dirname, '../server/radio/stations.json'))
    stations = JSON.parse(stations.toString())

    let sortedStations = {}
    for (let station in stations) { // instead of saving each song played as obj, merging objects and saving when they were played
      let originalSongs = []
      let numAllSongs = 0
      let latestSong = { dates: [0], name: '', artist: '' }
      stations[station].forEach(song => {
        if (song.error) return
        numAllSongs += 1
        latestSong = song
        if (originalSongs.length === 0) {
          originalSongs.push(song)
          return
        }

        let index = originalSongs.findIndex((originalSong) => originalSong.name == song.name)
        if (index > -1) originalSongs[index].dates.push(song.dates[0])
        else originalSongs.push(song)
      })

      originalSongs.sort((a, b) => b.length - a.length) // sorting from most played to least played song

      sortedStations[station] = {
        score: originalSongs.length == 0 || numAllSongs == 0 ? '0.0' : (originalSongs.length / numAllSongs * 100).toFixed(1),
        numOriginalSongs: originalSongs.length,
        numAllSongs: numAllSongs,
        latestSong: latestSong,
        songs: originalSongs
      }
    }
    sortedStations.sort((a, b) => b.numOriginalSongs - a.numOriginalSongs)

    res.render('radio.ejs', { stationsStr: JSON.stringify(sortedStations) })
  }
  exp.initiateRadio = (socket) => {

  }

  return exp
}
