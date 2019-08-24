module.exports = (db, standardOptions) => {
  async function route(req, res) {
    let options = standardOptions
    options.partials = ['partials/wolmolen.ejs']

    const wolmolenInfo = await db.getItem('wolmolen')
    options.partialOptions = {
      stock: wolmolenInfo.stock,
      priceIncBtw: wolmolenInfo.priceStr.incBtw
    }

    res.render('index.ejs', wolmolen)
  }
  return { route }
}
