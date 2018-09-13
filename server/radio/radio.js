const puppeteer = require('puppeteer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const adapter = new FileSync(path.join(__dirname, 'stations.json'));
const db = low(adapter);
const colors = require('colors/safe');

db.defaults({
  skyRadio: [],
  radio10: [],
  NPORadio2: [],
  QMusic: [],
  radioVeronica: [],
  radio100pNL: [],
  radio3FM: []
}).write();

const getSongDelay = 1000;
let browser;
let headless = true;

async function openPage({ blockReq, headless }) {
  let options = { headless: headless, ignoreHTTPSErrors: true }
  if (blockReq) { options.args = ['--no-sandbox', "--disable-accelerated-2d-canvas", "--disable-gpu", '--disable-web-security', '--disable-dev-profile'] }

  if (!browser) browser = await puppeteer.launch(options);
  let page = await browser.newPage();

  if (blockReq) {
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.resourceType() === 'image') request.abort();
      else request.continue();
    });
  }
  return page;
}

const scrapeLog = ({ station, song }) => {
  try {
    if (song.error || !song.name || !song.artist) {
      console.log(colors.red(station, '\t', JSON.stringify(song.name), '\t', JSON.stringify(song.name), JSON.stringify(song.errorMsg)));
    } else {
      // console.log('scraped', station, JSON.stringify(song));
    }
  } catch (err) {
    console.error(colors.red(err));
  }
}

async function saveSong({ song, station }) {
  try {
    let songsPlayed = await db.get(station).write();
    // song.artist = (song.artist).replace(/\s/g, '').toLowerCase();
    // song.name = (song.name).replace(/\s/g, '').toLowerCase();

    if (!song.name) { song.name = '', song.error = true };
    if (!song.artist) { song.artist = '', song.error = true };

    let prevSong = songsPlayed[songsPlayed.length - 1] || {};
    if (prevSong.name !== song.name && prevSong.artist !== song.artist) {
      await db.get(station).push(song).write();
      console.log('saved\t', colors.green(songsPlayed.length), '\t', station, '\t', JSON.stringify(song.name), '\t\t', JSON.stringify(song.artist));
    }
  }
  catch (err) { console.error(err); }
}



const scrapeSkyRadio = async () => {
  let station = 'skyRadio'
  let page = await openPage({ blockReq: true, headless: headless });

  await page.goto('https://www.skyradio.nl/stations');
  await page.waitForSelector('#root > div > div > div > a');
  await page.click('#root > div > div > div > a');

  await page.waitForSelector('#root > div > div > div.stations-header > div.nowplaying > div.nowplaying-info > p.nowplaying-info-title > b', { timeout: 0 });
  await page.waitForSelector('#root > div > div > div.stations-header > div.nowplaying > div.nowplaying-info > p.nowplaying-info-artist', { timeout: 0 });

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      }
      try {
        song.name = document.querySelector('#root > div > div > div.stations-header > div.nowplaying > div.nowplaying-info > p.nowplaying-info-title > b').innerHTML.trim()
        song.artist = document.querySelector('#root > div > div > div.stations-header > div.nowplaying > div.nowplaying-info > p.nowplaying-info-artist').innerHTML.trim()
        song.error = false

      } catch (err) { console.error(err); }
      return song;
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeRadio10 = async () => {
  let station = 'radio10';
  let page = await openPage({ blockReq: false, headless: headless });
  await page.setViewport({ height: 200, width: 200 });
  await page.goto('https://www.radio10.nl/nieuws');
  await page.waitForSelector('#link');
  await page.click('#link');
  await page.waitForSelector('#player-holder > div:nth-child(1) > div > div > div.sc-kjoXOD.dVuRTQ > div.sc-cHGsZl.hLcQCx > div.sc-cJSrbW.karlJd > div.sc-ksYbfQ.gfQjpR')
  await page.waitForSelector('#player-holder > div:nth-child(1) > div > div > div.sc-kjoXOD.dVuRTQ > div.sc-cHGsZl.hLcQCx > div.sc-cJSrbW.karlJd > div.sc-hmzhuo.krKkJm')
  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      }
      try {
        song.name = document.querySelector('#player-holder > div:nth-child(1) > div > div > div.sc-kjoXOD.dVuRTQ > div.sc-cHGsZl.hLcQCx > div.sc-cJSrbW.karlJd > div.sc-ksYbfQ.gfQjpR').innerHTML.trim()
        song.artist = document.querySelector('#player-holder > div:nth-child(1) > div > div > div.sc-kjoXOD.dVuRTQ > div.sc-cHGsZl.hLcQCx > div.sc-cJSrbW.karlJd > div.sc-hmzhuo.krKkJm').innerHTML.trim()
        song.error = false

      } catch (err) { console.error(err); song.errorMsg = err.message }
      return song
    });

    scrapeLog({ song: song, station: station });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeQMusic = async () => {
  let station = 'QMusic';
  let page = await openPage({ blockReq: false, headless: headless });

  await page.goto('https://qmusic.nl/playlist/qmusic');
  await page.waitForSelector('#playlist-tracks > div.nano-content > div:nth-child(1) > span.title > span.track-name', { timeout: 0 });
  await page.waitForSelector('#playlist-tracks > div.nano-content > div:nth-child(1) > span.title > span.artist-name', { timeout: 0 });

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      }
      try {
        song.name = document.querySelector('#playlist-tracks > div.nano-content > div:nth-child(1) > span.title > span.track-name').innerHTML.trim()
        song.artist = document.querySelector('#playlist-tracks > div.nano-content > div:nth-child(1) > span.title > span.artist-name').innerHTML.trim()
        song.error = false
      } catch (err) { console.error(err); }
      return song
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeNPORadio2 = async () => {
  let station = 'NPORadio2';
  let page = await openPage({ blockReq: true, headless: headless });

  await page.goto('http://radioplayer.npo.nl/_popupsites/radio2/playlist');
  await page.waitForSelector('#playlist_container > div:nth-child(1) > div.playlist_info > div.song', { timeout: 0 });
  await page.waitForSelector('#playlist_container > div:nth-child(1) > div.playlist_info > div.artist', { timeout: 0 });

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      }
      try {
        song.name = document.querySelector('#playlist_container > div:nth-child(1) > div.playlist_info > div.song').innerHTML.trim()
        song.artist = document.querySelector('#playlist_container > div:nth-child(1) > div.playlist_info > div.artist').innerHTML.trim()
        song.error = false
      } catch (err) { console.error(err); }
      return song
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeRadioVeronica = async () => {
  let station = 'radioVeronica';
  let page = await openPage({ blockReq: true, headless: headless });

  await page.goto('http://www.radioveronica.nl/');
  await page.waitForSelector('body > div > div.footer > a');
  await page.click('body > div > div.footer > a');
  await page.waitForSelector('body > header > div:nth-child(2) > div > div > div.onAirBar-track.track > div.track-info > span.track-title', { timeout: 0 });
  await page.waitForSelector('body > header > div:nth-child(2) > div > div > div.onAirBar-track.track > div.track-info > span.track-artist', { timeout: 0 });

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      };
      try {
        song.name = document.querySelector('body > header > div:nth-child(2) > div > div > div.onAirBar-track.track > div.track-info > span.track-title').innerHTML.trim()
        song.artist = document.querySelector('body > header > div:nth-child(2) > div > div > div.onAirBar-track.track > div.track-info > span.track-artist').innerHTML.trim()
        song.error = false
      } catch (err) { console.error(err); }
      return song
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeRadio100pNL = async () => {
  let station = 'radio100pNL';
  let page = await openPage({ blockReq: false, headless: headless });

  await page.goto('https://www.100p.nl/site/programmering/frequenties/digitaal');
  await page.waitForSelector('body > div.bootstrap > div.l-container-fluid > aside > section > div > div.col-sm-12.hidden-xs > div > div.col-xs-4.col-sm-12 > div.current-song > figcaption > div.current-song-title', { timeout: 0 });
  await page.waitForSelector('body > div.bootstrap > div.l-container-fluid > aside > section > div > div.col-sm-12.hidden-xs > div > div.col-xs-4.col-sm-12 > div.current-song > figcaption > div.current-song-artist', { timeout: 0 });

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      };
      try {
        song.name = document.querySelector('body > div.bootstrap > div.l-container-fluid > aside > section > div > div.col-sm-12.hidden-xs > div > div.col-xs-4.col-sm-12 > div.current-song > figcaption > div.current-song-title').innerHTML.trim()
        song.artist = document.querySelector('body > div.bootstrap > div.l-container-fluid > aside > section > div > div.col-sm-12.hidden-xs > div > div.col-xs-4.col-sm-12 > div.current-song > figcaption > div.current-song-artist').innerHTML.trim()
        song.error = false
      } catch (err) { console.error(err); }
      return song
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

const scrapeRadio3FM = async () => {
  let station = 'radio3FM';
  let page = await openPage({ blockReq: true, headless: headless });

  await page.goto('https://www.npo3fm.nl/');
  await page.waitForSelector('#ccm_col_content_cookieitems-list > li:nth-child(1) > div > label:nth-child(2) > span > svg');

  await page.click('#ccm_col_content_cookieitems-list > li:nth-child(1) > div > label:nth-child(2) > span > svg');
  await page.click('#ccm_col_content_cookieitems-list > li:nth-child(2) > div > label:nth-child(2) > span > svg');
  await page.click('#ccm_col_content_footer > button');

  await page.waitForNavigation();

  async function getSong() {
    let song = await page.evaluate(() => {
      let song = {
        error: true,
        date: (new Date()).toLocaleString('en-GB'),
      };
      try {
        song.name = document.querySelector('body > div.header-container > div.header-content.header-content--large > div.container.header__buttons-container > div.now-playing.js-songversion > div.now-playing__content > span.js-now-playing-track-title').innerHTML.trim()
        song.artist = document.querySelector('body > div.header-container > div.header-content.header-content--large > div.container.header__buttons-container > div.now-playing.js-songversion > div.now-playing__content > span.js-now-playing-artist').innerHTML.trim()
        song.error = false
      } catch (err) { console.error(err); song.errorMsg = err.message }
      return song
    });

    scrapeLog({ station: station, song: song });
    saveSong({ song: song, station: station });
    await page.waitFor(getSongDelay);
    getSong();
  }
  getSong();
};

Promise.all([
  scrapeRadio10(),
  scrapeSkyRadio(),
  scrapeQMusic(),
  scrapeNPORadio2(),
  scrapeRadioVeronica(),
  scrapeRadio100pNL(),
  scrapeRadio3FM(),
]).catch(err => console.error(err));

console.log('started app');
