const path = require('path')
const completeAddress = require(path.join(process.env.root, 'server/completeAddress.js'))

module.exports = (db, options) => {
  async function route(req, res) {
    let checkout = options
    checkout.partials = ['partials/checkout.ejs']

    // const wolmolenStock = await db.getWolmolenStock()
    // checkout.partialOptions = { wolmolenStock }

    res.render('index.ejs', checkout)
  }

  async function validateContact(socket, contact) {
    try {
      if (contact.postalCode.length == 0) return
      if (contact.houseNumber.length == 0) return
      let newHousenumber = contact.houseNumber.split(' ')
      contact.houseNumber = newHousenumber[0]
      contact.addition = newHousenumber[1]
      const completedAddress = await completeAddress(contact)
      if (completedAddress.error) return
      socket.emit('completeAddress', completedAddress)

      if (contact.firstName.length == 0) return
      if (contact.lastName.length == 0) return

    } catch (err) { }
  }

  return {
    route,
    validateContact
  }
}
