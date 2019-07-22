const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const path = require('path')

const adapter = new FileAsync(path.join(__dirname, 'db.json'))

module.exports = async () => {
  const db = await low(adapter)
  db.defaults({ wolmolenStock: 0 })
    .write()

  async function getWolmolenStock() {
    return await db.get('wolmolenStock').value()
  }

  async function updateWolmolenStock(amount) {
    const res = await db.update('wolmolenStock', n => n + amount)
      .write()
    return res.wolmolenStock
  }

  return {
    getWolmolenStock,
    updateWolmolenStock
  }
}
