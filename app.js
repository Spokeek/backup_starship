const express = require('express')
const app = express()
const isAmiral = false;
const idFleet;

app.put('/code', function(req, res) {
	const code = req.body.code;
	var expired = existInDb(code);
	if(code && exist === 0){
		res.status = 200;
		res.send({
			'newCode' : getCode(),
			'idFleet' : idFleet
		});
	}else{ 
		res.status = 400;
		var idErr;
		if(!code){		
			idErr = 1;
		}else{
			idErr = exist;
		}
		res.send({'idErr' : idErr});
	}
	
})

function getCode(code){
	//TODO implement
	// Revoir ou on stock cette valeur
	return '123';
}
function existInDb(code){
	var codesFromDb = getAllExistingCodes();
	if(codesFromDb[code]){
		if(!isExpired(codesFromDb,code)){
			// not expired
			return 0;
		}
		// exist but expired
		return 3;
	}
	// not existing
	return 2;
}
function isExpired(codeFromDb,code){
	// 18 * 5 min = 1h30
	// todo , use timestamp
	if(codeFromDb.indexOf(code) < 18){
		return false;
	}
	return true;
}
function getAllExistingCodes(){
	// TODO implement with db
	return [];
}

app.listen(3000, function () {
	if(process.args[0]){
		isAmiral = true;
		idFleet = process.args[0];
	}
	console.log('App listening on port 3000!')
})