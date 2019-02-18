const fs = require('fs');
const path = require('path');
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat)

const filesDir = path.join(__dirname, '/public/drop/files/');

(async () => {
  let x = await stat(path.join(filesDir, 'newest.txt'));
  console.log(x.birthtimeMs);
})()
