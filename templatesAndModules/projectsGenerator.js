const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const path = require('path');
const fs = require('fs');

(async () => {
  const project = process.argv[2];
  const folderPath = path.join(__dirname, '../public/img/projectImg', project)


  let filesFormated = [];

  const files = fs.readdirSync(folderPath);

  for (file of files) {
    let src = path.join('/img/projectImg/', project, file);
    let dimentions = await sizeOf(path.join(__dirname, '../public/', src));

    filesFormated.push({
      src,
      w: dimentions.width,
      h: dimentions.height
    });
  }
  let thumbnail = filesFormated[0].src;
  filesFormated = JSON.stringify(filesFormated)
  filesFormated = filesFormated.replace(/\"src\"/g, 'src')
  filesFormated = filesFormated.replace(/\"w\"/g, 'w')
  filesFormated = filesFormated.replace(/\"h\"/g, 'h')


  let img = `<img src="${thumbnail}" onclick='openPopup(${filesFormated})' class="flexbinImage" id="${project}">`
  console.log(img);

})();

//node templatesAndModules/projectsGenerator.js table | xsel -ib
