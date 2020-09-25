// Database pool 관련파일

const mysql = require("mysql");
const secret_config = requre("./secret_config");

// 데이터베이스 풀 생성
const pool = mysql.createPool({
	"host": secret_config.host,
	"user": secret_config.user,
	"password" : secret_config.password ,
	"port" : secret_config.port,
	"database" : secret_config.database
});

// 해당 pool을 다른 js파일에서 사용할 수 있도록 module화
module.exports = {
	pool: pool
};
