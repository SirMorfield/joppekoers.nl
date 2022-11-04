module.exports = (title) => {
	function router(req, res) {
		const options = {
			errorCode: 404,
			errorMessage: 'Not found',
		}
		res.render('error.ejs', options)
	}
	return router
}
