const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const lib = require(path.resolve('lib'))

const constants = require(path.resolve('Database/DatabaseConstants'))

const databaseDefaultPath = path.resolve('database.db')

class Database{

	constructor(databasePath){
		if(!databasePath){
			databasePath = databaseDefaultPath
		}

		this.databasePath = databasePath
	}

	init(){
		return new Promise((res, rej) => {
			this.getDb().run(constants.SQL_CREATE_TABLE, (err) => {
				if(err){
					rej(err)
				}
				else{
					res()
				}
			})
		})
	}

	getDb(){
		if(!this.db){
			this.db = new sqlite3.Database(this.databasePath)
		}
		return this.db
	}

	addToken(newToken){
		return new Promise((res, rej) => {
			this.getDb().run(constants.SQL_ADD_TOKEN, {
				[constants.SQL_ADD_TOKEN_PARAM_VALUE]: newToken,
				[constants.SQL_ADD_TOKEN_PARAM_TIMESTAMP]: lib.momentToDateTime()
			}, (err) => {
				if(err){
					rej(err)
				}
				else{
					console.log(`Token ${newToken} added to database`)
					res()
				}
			})
		})
	}

	getToken(token){
		return new Promise((res, rej) => {
			this.getDb().get(constants.SQL_GET_TOKEN, {[constants.SQL_GET_TOKEN_PARAM_VALUE]: token}, (err, row) => {
				if(err){
					rej(err)
				}
				else{
					if(row){
						row[constants.COLUMN_TOKENS_TIMESTAMP] = lib.DateTimeToMoment(row[constants.COLUMN_TOKENS_TIMESTAMP])
					}
					res(row)
				}
			})
		})
	}

	getLastToken(){
		return new Promise((res, rej) => {
			this.getDb().get(constants.SQL_GET_LAST_TOKEN, (err, row) => {
				if(err){
					rej(err)
				}
				else{
					row[constants.COLUMN_TOKENS_TIMESTAMP] = lib.DateTimeToMoment(row[constants.COLUMN_TOKENS_TIMESTAMP])
					res(row)
				}
			})
		})
	}

	getTokensSince(date){
		return new Promise((res, rej) => {
			this.getDb().all(constants.SQL_GET_TOKEN_SINCE_DATE, {[constants.SQL_GET_TOKEN_SINCE_DATE_PARAM_TIMESTAMP]: lib.momentToDateTime(date)}, (err, rows) => {
				if(err){
					rej(err)
				}
				else{
					rows = rows.map((row) => Object.assign(row, {[constants.COLUMN_TOKENS_TIMESTAMP]: lib.DateTimeToMoment(row[constants.COLUMN_TOKENS_TIMESTAMP])}))
					res(rows)
				}
			})
		})
	}

	removeTokensOlderThan(date){
		return new Promise((res, rej) => {
			this.getDb().run(constants.SQL_REMOVE_TOKENS_OLDER, {[constants.SQL_REMOVE_TOKENS_OLDER_PARAM_TIMESTAMP]: lib.momentToDateTime(date)}, (err) => {
				if(err){
					rej(err)
				}
				else{
					res()
				}
			})
		})
	}

	close(){
		if(this.db){
			return new Promise((res, rej) => {
				this.db.close((err) => {
					if(err){
						rej(err)
					}
					else{
						res()
					}
				})
			})
		}
		else{
			return Promise.resolve()
		}
	}
}

module.exports = Database