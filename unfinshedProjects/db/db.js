const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const path = require('path')
const env = require(path.join(process.env['srcRoot'], 'configs/env.json'))

const adapter = new FileAsync(path.join(__dirname, 'db.json'))

module.exports = async () => {
	const db = await low(adapter)

	async function getItem(itemID) {
		try {
			if (typeof itemID !== 'string' || itemID.length === 0) {
				return { error: `invalid itemID ${itemID}` }
			}
			const items = await db.get('warehouse').value()

			for (let item of items) {
				if (item.id == itemID) {
					item.priceStr = {
						incBtw: (item.priceExBtw * env.btw).toFixed(2),
						exBtw: item.priceExBtw.toFixed(2)
					}
					return item
				}
			}
			return { error: 'Item not found' }
		} catch (error) { return { error } }
	}

	async function updateStock(itemID, amount) {
		try {
			if (typeof itemId !== 'string' || itemID.length === 0) return { error: `invalid itemID ${itemID}` }
			if (typeof amount !== 'number') return { error: `invalid amount ${amount}` }

			const items = await db.get('warehouse').value()
			const newItems = JSON.parse(JSON.stringify(items))
			newItems = newItems.map((item) => {
				if (item.id === itemID) {
					item.stock += amount
					return item
				}
				return item
			})

			await db.assign('warehouse', newItems)
		} catch (error) { return { error } }
	}

	return {
		getItem,
		updateStock
	}
}
