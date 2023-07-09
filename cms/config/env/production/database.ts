import path from 'path'

export default () => ({
	connection: {
		client: 'sqlite',
		connection: {
			filename: path.join(__dirname, '../../db/db.db'),
		},
		useNullAsDefault: true,
	},
})
