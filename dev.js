const path = require('path')
const BDD = require(path.resolve('BDD'))
const lib = require(path.resolve('lib'))

const DB = new BDD()
const token = lib.getNewToken()
console.log(token)
DB.init()
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(token))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.getToken(token))
.then((row) => console.log(row))
.then(() => DB.close())
.catch(err => console.log("[ERROR]", err))