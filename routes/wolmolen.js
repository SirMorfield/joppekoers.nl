module.exports = (db, options) => {
  async function route(req, res) {
    let wolmolen = options
    wolmolen.partials = ['partials/wolmolen.ejs']

    const wolmolenStock = await db.getWolmolenStock()
    wolmolen.partialOptions = { wolmolenStock }

    res.render('index.ejs', wolmolen)
  }
  return { route }
}
