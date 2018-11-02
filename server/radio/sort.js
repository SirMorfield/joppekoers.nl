const jsonfile = require('jsonfile');
const stations = jsonfile.readFileSync('stations.json')

function msToTime(milli) { milli = parseInt(milli); let d, h, m, s, ms; s = Math.floor(milli / 1000); m = Math.floor(s / 60); s = s % 60; h = Math.floor(m / 60); m = m % 60; d = Math.floor(h / 24); h = h % 24; ms = Math.floor((milli % 1000) * 1000) / 1000; return 'd:' + d + ' h:' + h + ' m:' + m + ' s:' + s + ' ms:' + ms }

const dateToMs = (dateString) => {
  let dateArgs = dateString.match(/\d{2,4}/g),
    year = dateArgs[2],
    month = parseInt(dateArgs[1]) - 1,
    day = dateArgs[0],
    hour = dateArgs[3],
    minutes = dateArgs[4];

  return new Date(year, month, day, hour, minutes).getTime();
}

const sortByOccurrences = (_stationArr, _length) => {
  //adding occuraceses key to each song element
  _stationArr.forEach(song => {
    let occurrences = _stationArr.filter(x => { return x.name.replace(/\s/g, '').toLowerCase() == song.name.replace(/\s/g, '').toLowerCase(); }).length;
    song.occurrences = occurrences;
    delete song.date;
  });

  //removing the duplicates
  _stationArr.sort((a, b) => { return b.occurrences - a.occurrences; });
  let result = _stationArr.reduce((x, y) => x.findIndex(e => e.name == y.name) < 0 ? [...x, y] : x, [])
  if (_length) result = result.slice(0, _length);
  return result;
}

const sortAndSaveStations = () => {
  let sorted = [];
  Object.keys(stations).forEach(station => {
    let beginTime = dateToMs(stations[station][0].date);
    let endTime = dateToMs(stations[station][stations[station].length - 2].date);

    sorted.push({
      station: station,
      scrapeTime: msToTime(endTime - beginTime),
      scrapeTimeMs: parseInt(endTime) - parseInt(beginTime),
      allSongsLength: stations[station].length,
      songs: sortByOccurrences(stations[station])
    })
  });

  sorted.forEach((station, index1) => {
    station.originalSongsLength = station.songs.length;
    station.score = (station.songs.length / station.allSongsLength) * 100;
    station.songs.forEach((song, index2) => {
      sorted[index1].songs[index2].playedEvery = msToTime(parseInt(station.scrapeTimeMs) / parseInt(song.occurrences));
    });
  });

  jsonfile.writeFileSync('./sorted.json', sorted, { spaces: 2, EOL: '\r\n' })
}

sortAndSaveStations();
