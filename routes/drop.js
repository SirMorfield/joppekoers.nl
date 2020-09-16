const mime = require('mime-types')
const path = require('path')
const exec = require('util').promisify(require('child_process').exec);
const fs = require('fs')

const dbPath = path.join(__dirname, '../server/dropDb.json')
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
const db = JSON.parse(fs.readFileSync(dbPath))

const dbFilesPath = path.join(__dirname, '../server/drop/')
if (!fs.existsSync(dbFilesPath)) fs.mkdirSync(dbFilesPath)

async function getSize(path) {
	const { stdout, stderr } = await exec(`du -s -B1 '${path}'`)
	if (stderr) return -1
	return parseInt(stdout.split(' ')[0])
}

function formattedTimestamp(d) {
	const date = d.toISOString().split('T')[0]
	const time = d.toTimeString().split(' ')[0]
	const ms = `${d.getMilliseconds()}`.padStart(3, '0')
	return `${date} ${time}:${ms}`
}

function drop(req, res) {
	res.render('drop.ejs')
}

async function upload(req, res) {
	const file = req.files.upfile
	const identifier = req.body.identifier

	if (!file) {
		res.send('No File selected')
		return
	}
	if (identifier.length == 0 || dbFilesPath[identifier]) {
		res.send('Identifier already in use')
		return
	}
	if ((await getSize(dbFilesPath)) > 2.147e10) { // 20 GB
		res.send('Server is full')
		return
	}

	const saveName = `${formattedTimestamp(new Date())}.${mime.extension(file.mimetype)}`
	const savePath = path.join(dbFilesPath, saveName)

	file.mv(savePath, (err) => {
		if (err) {
			console.error(err)
			res.send('Error occurred')
			return
		} else {
			db[identifier] = [
				{
					path: savePath,
					name: file.name
				}
			]
			res.send(`Done, go to joppekoers.nl/drop/${identifier} to download it`)
			fs.promises.writeFile(dbPath, JSON.stringify(db))
			return
		}
	})
}

async function download(req, res) {
	const identifier = req.params.identifier
	if (identifier.length == 0)
	{
		res.send('Empty identifier')
		return
	}
	if (!db[identifier])
	{
		res.send('Identifier not found')
		return
	}
	for (const file of db[identifier]) {
		res.download(file.path, file.name)
	}
}

module.exports = {
	drop,
	upload,
	download
}
