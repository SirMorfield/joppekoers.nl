const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const path = require('path')
const env = require(path.join(process.env.PWD, 'configs/env.json'))

const adapter = new FileAsync(path.join(__dirname, 'db.json'))

module.exports = async () => {
  const db = await low(adapter)

  async function getItem(itemID) {
    try {
      if (typeof itemId !== 'string' || itemID.length === 0) return { error: `invalid itemID ${itemID}` }
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

// copy((() => {
//   let address = document.querySelector('#infoMapWrapper > div.infoBox.flex.flex-row > div > section.card-body').innerText.split(' ')
//   let openingHours = [
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(6) > td:nth-child(2)").innerText,
//     document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(1) > div > table > tbody > tr:nth-child(7) > td:nth-child(2)").innerText
//   ]
//   let url = document.querySelector("body > div.userpanel-tabs.js-userpanel-tabs.show > div > div > div > div.restaurant-tab-content > div.tab-moreinfo > div.grid > div > div:nth-child(3) > div > a").innerText
//   let str = `${address[address.length - 2]}, Amsterdam,,${url},,,,,${openingHours.join(',')}`.replace(/\n/g, ' ')
//   return str
// })())
