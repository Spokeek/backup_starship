const path = require('path')
const lib = require(path.resolve('lib'))
const moment = require('moment')
const amiralHost = process.env.HOST || 'localhost'
const amiralPort = process.env.HOST_PORT || 3000
const serverPort = process.env.PORT || 3001

const startupToken = process.env.TOKEN
if(!startupToken){
	lib.log("Error, please provide the amiral startup 'TOKEN' environement variable", true)
	process.exit()
}

const intervalRequestInMin = 5
const expirationTimeTokenInMin = 90

const rp = require('request-promise');

const Database = require(path.resolve('database/Database'))
const DatabaseConstants = require(path.resolve('database/DatabaseConstants'))
const DB = new Database(null, true)

let numberOfProblems = 0
let fleet = ""
let lastConection = moment()

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
	if(!fleet){
		res.send("Sorry, this satelite is not connected to any amiral")
	}
	else{
		res.send(`Hello, this satelite is part of the fleet ${fleet} , the last communication was at ${lastConection}`)
	}
})

const loopFunction = (row, isInSearch) => {
	const token = row[DatabaseConstants.COLUMN_TOKENS_VALUE]

	const options = {
	    method: 'PUT',
	    uri: `http://${amiralHost}:${amiralPort}/code`,
	    body: {
	        code: token
	    },
	    json: true
	}

	rp(options)
	.then((json) => {
		numberOfProblems = 0
		const {idFleet, newCode} = json
		fleet = idFleet
		lastConection = moment()
		lib.log(`The fleet '${idFleet}' is returning the token '${newCode}'`)
		DB.addToken(newCode)
	})
	.catch((json) => {
		lib.log("Error during HTTP request ")
		switch(json.error.idErr){
			case 1:
				lib.log("No token was given, this is problematic !!", true)
				process.exit()
				break
			case 2:
				lib.log(`The token '${token}' is invalid.`)
				if(!isInSearch){
					numberOfProblems++
					DB.getTokensSince(moment(0))
					.then((rows) => rows.forEach((row) => {
						loopFunction(row, true)
					}))
				}
				break
			case 3:
				lib.log(`The token '${token} is expired. Please reboot and give a more recent token`)
				process.exit()
				 break
		}
	})
}

const intervalFunction = () => {
	if(numberOfProblems >= 5){
		lib.log("Error, the satelite is now disconnected from the database", true)
		process.exit()
	}

	DB.getLastToken()
	.then((row) => {
		loopFunction(row)
	})
}

DB.init()
.then(() => DB.addToken(startupToken))
.then(() => intervalFunction())

const server = app.listen(serverPort, function () {
  lib.log(`Satelite app listening on port ${serverPort} !`, true)
})

const loop = setInterval(intervalFunction, intervalRequestInMin * 60 * 1000 )

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
		lib.log("The application exited successfully.", true)
		res()
	}))
	.then(() =>	process.exit())
	.catch((ex) => {
		lib.log(`A problem occured\n${ex}`, true)
		process.exit()
	})
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

