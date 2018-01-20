const TOKENS_TABLE_NAME = 'tokens'
const COLUMN_TOKENS_ID = 'tokens_id'
const COLUMN_TOKENS_VALUE = 'tokens_value'
const COLUMN_TOKENS_TIMESTAMP = 'tokens_timestamp'


const SQL_CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS ${TOKENS_TABLE_NAME} (
 ${COLUMN_TOKENS_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
 ${COLUMN_TOKENS_VALUE} TEXT NOT NULL UNIQUE,
 ${COLUMN_TOKENS_TIMESTAMP} DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

const SQL_ADD_TOKEN_PARAM_VALUE = '$tokenValue'
const SQL_ADD_TOKEN = `
INSERT INTO ${TOKENS_TABLE_NAME} (
 ${COLUMN_TOKENS_VALUE}
)
VALUES (
${SQL_ADD_TOKEN_PARAM_VALUE}
);
`

const SQL_GET_TOKEN_PARAM_VALUE = '$tokenToGet'
const SQL_GET_TOKEN = `
SELECT * FROM ${TOKENS_TABLE_NAME}
WHERE ${COLUMN_TOKENS_VALUE} = ${SQL_GET_TOKEN_PARAM_VALUE}
`

module.exports = {
	SQL_CREATE_TABLE,

	SQL_ADD_TOKEN,
	SQL_ADD_TOKEN_PARAM_VALUE,

	SQL_GET_TOKEN,
	SQL_GET_TOKEN_PARAM_VALUE,
}