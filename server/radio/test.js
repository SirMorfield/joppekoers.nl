const jsonfile = require('jsonfile');
const stations = jsonfile.readFileSync('stations.json')

function msToTime(milli) { milli = parseInt(milli); let d, h, m, s, ms; s = Math.floor(milli / 1000); m = Math.floor(s / 60); s = s % 60; h = Math.floor(m / 60); m = m % 60; d = Math.floor(h / 24); h = h % 24; ms = Math.floor((milli % 1000) * 1000) / 1000; return ('d:' + d + ' h:' + h + ' m:' + m + ' s:' + s + ' ms:' + ms) }

let station = 'skyRadio';
let sorted = [];

let beginTime = new Date(stations[station][0].date);
let endTime = new Date((stations[station][stations[station].length - 2]).date);

console.log(beginTime, endTime);
sorted.push({
  scrapeTime: msToTime(endTime - beginTime),
  station: station,
  allSongsLength: stations[station].length,
  // songs: sortByOccurrences(stations[station])
})

console.log(sorted);
