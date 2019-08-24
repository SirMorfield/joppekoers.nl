module.exports = (db, options) => {
  async function route(req, res) {
    let checkout = options
    checkout.partials = ['partials/checkout.ejs']

    const wolmolenStock = await db.getWolmolenStock()
    checkout.partialOptions = { wolmolenStock }



    res.render('index.ejs', checkout)
  }
  return { route }
}
