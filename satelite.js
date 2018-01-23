const path = require('path')
const lib = require(path.resolve('lib'))

const amiralHost = process.env.HOST || 'localhost'
const amiralPort = process.env.PORT || 3000

const startupToken = process.env.TOKEN
if(!startupToken){
	lib.log("Error, please provide the amiral startup 'TOKEN' environement variable", true)
	process.exit()
}

const intervalRequestInMin = 5

const rp = require('request-promise');

const Database = require(path.resolve('database/Database'))
const DatabaseConstants = require(path.resolve('database/DatabaseConstants'))
const DB = new Database(null, true)

const loopFunction = (row) => {
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
		const {idFleet, newCode} = json
		lib.log(`The fleet '${idFleet}' is returning the token '${newCode}'`)
		lib.addToken(newCode)
	})
	.catch((json) => {
		switch(json.idErr){
			case 1:
				lib.log("No token was given, this is problematic !!", true)
				process.exit()
				break
			case 2:
				lib.log(`The token '${token}' is invalid.`)
				console.log("MAKE TEST WITH OLDERS")
				loopFunction()
				break
			case 3:
				lib.log(`The token '${token} is expired. Please reboot and give a more recent token`)
				process.exit()
				 break
		}
	})
}

const intervalFunction = () => {
	DB.getLastToken()
	.then((row) => {
		loopFunction(row)
	})
}

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

