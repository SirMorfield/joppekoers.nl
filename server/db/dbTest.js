
(async () => {
  const db = await require('./db.js')()

  let a = await db.getWolmolenStock()
  console.log(a)

  let b = await db.updateWolmolenStock(-1)
  console.log(b.wolmolenStock, 'this')

  a = await db.getWolmolenStock()
  console.log(a)

})()
