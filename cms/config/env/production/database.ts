import path from 'path'

const dbFile = path.join(__dirname, '../../../../db/db.db')
console.log('Sqlite file path prod', dbFile)
export default () => ({
	connection: {
		client: 'sqlite',
		connection: {
			filename: dbFile,
		},
		useNullAsDefault: true,
	},
})
