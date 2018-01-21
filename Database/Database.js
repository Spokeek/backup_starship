const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const lib = require(path.resolve('lib'))

const constants = require(path.resolve('Database/DatabaseConstants'))

const databaseDefaultPath = path.resolve('database.db')

class Database{

	constructor(databasePath, verbose){
		if(!databasePath){
			databasePath = databaseDefaultPath
		}

		this.databasePath = databasePath
		this.verbose = verbose
	}

	_log(message){
		if(this.verbose){
			console.log(message)
		}
	}

	init(){
		return new Promise((res, rej) => {
			this.getDb().run(constants.SQL_CREATE_TABLE, (err) => {
				if(err){
					rej(err)
				}
				else{
					this._log("Database initialised.")
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
					this._log(`Token ${newToken} added to database`)
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
					this._log(`getToken from ${token} returned ${row}`)
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
				else if(!row){
					rej("There is no last token, this is a problem")
				}
				else{
					row[constants.COLUMN_TOKENS_TIMESTAMP] = lib.DateTimeToMoment(row[constants.COLUMN_TOKENS_TIMESTAMP]).
					this._log(`The last token saved is ${row}`)
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
					this._log(`From the getTokenSince ${date} , we returned ${rows.length} results`)
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
					this._log(`We cleaned the tokens where date is older than ${date}`)
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
						this._log('The database has been closed')
						res()
					}
				})
			})
		}
		else{
			this._log('The database was allready closed')
			return Promise.resolve()
		}
	}
}

module.exports = Database