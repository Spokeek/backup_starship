const moment = require('moment')

const getNewToken = () => {
	let token = ""
	for(var i = 0; i < 8; i++){
		const num = Math.ceil((Math.random() * 36) - 1) 
		if(num <= 9){
			token += num.toString()
			continue
		}
		else{
			/*
			97 is the index where the alphabet begins
			10 is the last index we use for numbers ( look before )
			*/
			token += String.fromCharCode(97 + num - 10)
			continue
		}
	}
	return token
}

const momentConversionFormat = 'YYYY-MM-DD HH:mm:ss'

const momentToDateTime = (momentTime) => {
	if(!momentTime){
		momentTime = moment()
	}
	else if(!momentTime.format){
		momentTime = moment(momentTime)
	}

	return momentTime.format(momentConversionFormat)
}

const DateTimeToMoment = (dateTime) => moment(dateTime, momentConversionFormat)

const log = (message, force) => {
	if(force || process.env['VERBOSE_LEVEL'] === 'LOG')
	console.log(`${'-'.repeat(process.stdout.columns)}\n[${moment().format('HH:mm:ss:SSS')}] => ${message}`)
}

module.exports = {getNewToken, momentToDateTime, DateTimeToMoment, log}