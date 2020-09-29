// Database pool 관련파일

const mysql = require("mysql");
const secret_config = require("./secret_config");

// 데이터베이스 풀 생성
const pool = mysql.createPool({
	"host": secret_config.DB.host,
	"user": secret_config.DB.user,
	"password" : secret_config.DB.password ,
	"port" : secret_config.DB.port,
	"database" : secret_config.DB.database
});

// 해당 pool을 다른 js파일에서 사용할 수 있도록 module화
module.exports = {
	pool: pool
};
