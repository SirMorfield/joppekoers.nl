(async () => {
  const puppeteer = require('puppeteer')
  const low = require('lowdb')
  const FileAsync = require('lowdb/adapters/FileAsync')
  const adapter = new FileAsync('stations.json',
    {
      serialize: (array) => JSON.stringify(array),
      deserialize: (string) => JSON.parse(string)
    })
  const db = await low(adapter)

  const stations = [
    "100p-nl",
    "qmusic",
    "radio-10",
    "radio-2",
    "radio-3fm",
    "radio-538",
    "radio-veronica",
    "sky-radio"
  ]

  let defaults = {}
  stations.forEach(station => {
    defaults[station] = []
  })
  await db.defaults(defaults).write()

  let options = {
    // headless: false,
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', "--disable-accelerated-2d-canvas", "--disable-gpu", '--disable-web-security', '--disable-dev-profile', '--user-agent=Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36', '--window-size=1920,1040']
  }
  const browser = await puppeteer.launch(options)

  const getSongDelay = 60000

  async function openPage() {
    const page = await browser.newPage();
    await page.setRequestInterception(true)
    page.on('request', request => {
      if (request.resourceType() === 'image') request.abort()
      else request.continue()
    })
    return page
  }

  async function saveSong(song, station) {
    // let songs = await db.get(station).value()
    // let latest = songs[songs.length - 1]

    // if (song.error) {
    //   if (latest.error !== song.error) {
    //     await db.get(station).push(song).write()
    //   }
    //   return
    // }

    // if (latest.name !== song.name) {
    //   songs.push(song)
    //   let originalSongs = []
    //   songs.forEach(savedSong => {
    //     let index = originalSongs.findIndex((originalSong) => originalSong.name == savedSong.name)
    //     if (index) originalSongs[index].dates.push(savedSong.date)
    //     else originalSongs.push(savedSong)
    //   })
    //   db.set(station, originalSongs).write()
    // }
    const latest = await db.get(station).last().value()
    if (latest) {
      if (song.error) {
        if (latest.error === song.error) return
      }
      else if (latest.name === song.name) return
    }

    await db.get(station).push(song).write()
  }

  async function getSong(page, station) {
    let song = await page.evaluate(() => {
      let song = {
        dates: [Date.now()]
      }
      try {
        let x = document.querySelector('#player-station-info').innerHTML.trim().split(' - ')
        song.artist = x[0]
        song.name = x[1]
      } catch (err) { song.error = err.message }
      return song
    })
    saveSong(song, station)
  }

  async function scrape(station) {
    const page = await openPage()
    await page.goto(`https://www.radiozenders.fm/${station}`)
    await page.waitForSelector('#playlist_tab')
    await page.waitForSelector('#jp_container_1 > div > div.jp-gui.jp-interface.clearfix > div > div.jp-controls > button.jp-button.jp-stop')
    await page.waitForSelector('#station_playlist > tbody > tr:nth-child(1) > td:nth-child(2)')
    await page.click('#playlist_tab')
    await page.click('#jp_container_1 > div > div.jp-gui.jp-interface.clearfix > div > div.jp-controls > button.jp-button.jp-stop')
    await getSong(page, station)
    setInterval(async () => {
      getSong(page, station)
    }, getSongDelay)
  }

  stations.map((station) => scrape(station))
  console.log('started app')

})()
