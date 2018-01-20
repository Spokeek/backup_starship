const path = require('path')
const lib = require(path.resolve('./lib'))

const numberTries = 10000
for(var i = 0; i < numberTries; i++ ){
	const newToken = lib.getNewToken()
	if(!/[a-z0-9]{8}/.test(newToken)){
		throw new Error(`The 'newToken' function did an error by generating the '${newToken}' token.`)
	}
}
console.log(`The newToken function works fine, tried ${numberTries} times.`)