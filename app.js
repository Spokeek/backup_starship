const express = require('express')
const app = express()

app.put('/code', function(req, res) {
	const body = req.body;
	if(body.code && existInDb(body.code) && !isExpired(body.code)){
		res.status = 200;
		res.send({
			'newCode' : getCode(),
			'idFleet' : getIdFleet()
		});
	}else{ 
		res.status = 400;
		var idErr;
		if(!body.code){		
			idErr = 1;
		}else if(!existInDb(body.code){
			idErr = 2;
		}else if(isExpired()){
			idErr = 3;
		}else{
			res.status = 500;
		}
		res.send({'idErr' : idErr});
	}
	
})

function getCode(code){
	//TODO implement
	// Revoir ou on stock cette valeur
	return '123';
}
function getIdFleet(id){
	//TODO implement
	// Revoir ou on stock cette valeur
	return '123';
}
function existInDb(code){
	if(getAllExistingCodes[code]){
		return true;
	}
	return false;
}
function isExpired(){
	// 18 * 5 min = 1h30
	if(getAllExistingCodes.indexOf(code) < 18){
		return false;
	}
	return true;
}
function getAllExistingCodes(){
	// TODO implement with db
	return [];
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})