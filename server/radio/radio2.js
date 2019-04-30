(async () => {
  const puppeteer = require('puppeteer')
  const stations = [
    "100p-nl",
    "90s-dance-classics",
    "qmusic",
    "radio-1",
    "radio-10",
    "radio-2",
    "radio-3fm",
    "radio-4",
    "radio-5",
    "radio-538",
    "radio-6",
    "radio-decibel",
    "radio-veronica",
    "sky-radio"
  ]

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
    console.log(station, JSON.stringify(song))
    // let songsPlayed = await db.get(station).write()
    // if (typeof song.name !== 'string' || song.name.length < 1) { song.name = '', song.error = true }
    // if (typeof song.artist !== 'string' || song.artist.length < 1) { song.artist = '', song.error = true }

    // let prevSong = songsPlayed[songsPlayed.length - 1] || {}
    // if (prevSong.name !== song.name && prevSong.artist !== song.artist && prevSong.error !== song.error) {
    //   await db.get(station).push(song).write()
    //   console.log('saved\t', colors.green(songsPlayed.length), '\t', station, '\t', JSON.stringify(song.name), '\t\t', JSON.stringify(song.artist))
    // }

  }

  async function getSong(page, station) {
    let song = await page.evaluate(() => {
      let song = {
        date: Date.now()
      }
      try {
        let x = document.querySelector('#station_playlist > tbody > tr:nth-child(1) > td:nth-child(2)').innerHTML.trim().split(' - ')
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

  let scraping = stations.map((station) => scrape(station))
  console.log('started app')

})()
