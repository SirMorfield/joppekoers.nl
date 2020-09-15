module.exports = (title, db) => {
	async function router(req, res) {
		let options = {
			title,
			partial: 'partials/wolmolen.ejs'
		}

		let partialOptions = {
			stock: 0,
			priceIncBtw: '0.00'
		}

		const wolmolenInfo = await db.getItem('wolmolen')
		if (!wolmolenInfo.error) {
			partialOptions = {
				stock: wolmolenInfo.stock,
				priceIncBtw: wolmolenInfo.priceStr.incBtw
			}
		}

		options.partialOptions = partialOptions
		res.render('index.ejs', options)
	}

	return router
}
