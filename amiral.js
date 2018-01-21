const path = require('path')
const moment = require('moment')
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const regenerationTokenTimeInMin = 5
const expirationTimeTokenInMin = 90
const getCleanOldTokensTimeInMin = () => expirationTimeTokenInMin * 2

const idFleet = 'FLOTTE AMIRAL SCINTILLANT'

const lib = require(path.resolve('lib'))
const Database = require(path.resolve('Database/Database'))
const DatabaseConstants = require(path.resolve('Database/DatabaseConstants'))
const DB = new Database()

app.put('/code', (req, res) => {
	const token = (req.body || {}).code

	res.status(400)
	if(!token){
		res.send({idErr: 1})
	}
	else{
		DB.getToken(token)
		.then((row) => new Promise((resolve) => {
			if(!row){
				res.send({idErr: 2})
				resolve()
			}
			else if (moment().diff(row[DatabaseConstants.COLUMN_TOKENS_TIMESTAMP], 'minute') > expirationTimeTokenInMin){
				res.send({idErr: 3})
				resolve()
			}
			else{
				DB.getLastToken()
				.then((row) => {
					res.status(200).send({
						newCode: row[DatabaseConstants.COLUMN_TOKENS_VALUE],
						idFleet: idFleet
					})
					resolve()
				})		
			}
		}))
		.catch((err) => {
			res.status(500).send(err)
		})
	}
})

const server = app.listen(3000, function () {
  console.log('Amiral app listening on port 3000!')
})

const loopFunction = () => {
	const token = lib.getNewToken()
	DB.addToken(token)
	.then(() => DB.removeTokensOlderThan(moment().subtract(getCleanOldTokensTimeInMin(), 'minute')))
}

DB.init()
.then(() => loopFunction())

const loop = setInterval(loopFunction, (regenerationTokenTimeInMin * 60 * 1000) )// 5 Min

const exitHandler = () => {
	(new Promise((res) => {
		clearTimeout(loop)
		res()
	}))
	.then(() => DB.close())
	.then(() => new Promise((res) => {
		server.close()
		res()
	}))
	.then(() => new Promise((res) => {
		console.log("The application exited successfully.")
		res()
	}))
	.then(() =>	process.exit())
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

