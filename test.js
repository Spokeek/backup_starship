const path = require('path')

const lib = require(path.resolve('lib'))
const Database = require(path.resolve('database/Database'))
const DatabaseConstants = require(path.resolve('database/DatabaseConstants'))
debugger
let DB

const verbose = true
const log = (message) => {
	if(verbose){
		console.log(message)
	}
}

// Testing the 'getNewToken' lib function

const numberTries = 10000
for(var i = 0; i < numberTries; i++ ){
	const newToken = lib.getNewToken()
	if(!/[a-z0-9]{8}/.test(newToken)){
		throw new Error(`The 'newToken' function did an error by generating the '${newToken}' token.`)
	}
}
log(`The newToken function works fine, tried ${numberTries} times.`)

//########################################################################

// Testing the 'getDb' function of the 'Database' class

DB = new Database(':memory:')
if(!DB.getDb()){
	throw new Error("The function 'getDb' is supposed to return the Database object gererated")
}
else{
	log("The function 'getDb' works perfetcly.")
}
DB.close()

//########################################################################


// Testing Database creation test


DB = new Database(':memory:')
DB.init()
.then(() => new Promise((res, rej) => DB.getDb().get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${DatabaseConstants.TOKENS_TABLE_NAME}';`, (err, row) => {
	if(err){
		rej(err)
	}
	else if (!row){
		rej(`The table ${DatabaseConstants.TOKENS_TABLE_NAME} is not fould`)
	}
	else{
		res()
	}
})))
.then(() => {
	log("The database creation process works well.")
	return Promise.resolve()
})
.then(() => DB.close())
.catch((err) => {
	throw new Error(`Error during the database creation.\n${err}`)
})

//########################################################################


// Testing Database insert and fetch

DB = new Database(':memory:')
const token = lib.getNewToken()
DB.init()
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(token))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.addToken(lib.getNewToken()))
.then(() => DB.getToken(token))
.then((row) => new Promise((res, rej) => {
	const returnedValue = row[DatabaseConstants.COLUMN_TOKENS_VALUE]
	if( returnedValue !== token){
		rej(`The returned value is wrong : ${returnedValue} != ${token} .`)
	}
	else{
		log("The value retuned by the query is the one expected")
		return res()
	}
}))
.then(() => DB.close())
.catch((err) => {
	throw new Error(`Error during insert or fetch of row\n${err}`)
})
// may be blocked because we use the same DB variable ( context problem )