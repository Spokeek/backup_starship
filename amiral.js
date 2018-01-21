const path = require('path')
const moment = require('moment')
const express = require('express')
const app = express()

const lib = require(path.resolve('lib'))
const Database = require(path.resolve('Database/Database'))
const DatabaseConstants = require(path.resolve('Database/DatabaseConstants'))
const DB = new Database()
DB.init()

app.get('/', (req, res) => {
	DB.getLastToken()
	.then((row) => {
		res.send(`The new token is '${row[DatabaseConstants.COLUMN_TOKENS_VALUE]}'`);
	})
})

const server = app.listen(3000, function () {
  console.log('Dev app listening on port 3000!')
})

const loop = setInterval(() => {
	const token = lib.getNewToken()
	DB.addToken(token)
	.then(() => DB.removeTokensOlderThan(moment().subtract(1.5, 'hours')))
}, 300000)// 5 Min

process.on('SIGINT', function() {
	(new Promise((res) => {
		clearTimeout(loop)
		res()
	}))
	.then(() => DB.close())
	.then(() => new Promise((res) => {
		server.close()
		res()
	}))
	.then(() =>	process.exit())
})
