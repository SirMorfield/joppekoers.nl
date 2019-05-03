module.exports = (asyncFs, path) => {
  let ex = {}
  ex.root = async (req, res) => {
    let stations = await asyncFs.readFile(path.join(__dirname, '../server/radio/stations.json'))
    stations = JSON.parse(stations.toString())
    let sortedStations = {}
    for (let station in stations) { // instead of saving each song played as obj, merging objects and saving when they were played
      let originalSongs = []
      stations[station].forEach(song => {
        if (song.error) return
        if (originalSongs.length === 0) {
          originalSongs.push(song)
          return
        }
        let index = originalSongs.findIndex((originalSong) => originalSong.name == song.name)
        if (index > -1) originalSongs[index].dates.push(song.date);

        else originalSongs.push(song)
      })
      originalSongs.sort((a, b) => b.length - a.length) // sorting from most played to least played song
      sortedStations[station] = originalSongs
    }
    res.render('radio.ejs', { stations: JSON.stringify(sortedStations) })
  }

  return ex
}
