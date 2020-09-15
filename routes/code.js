module.exports = (title) => {
	function router(req, res) {
		let home = {
			title,
			partial: 'partials/home.ejs',
			partialOptions: null,
		}
		res.render('index.ejs', home)
	}
	return router
}
