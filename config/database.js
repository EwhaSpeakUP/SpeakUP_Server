// Database pool 관련파일

const mysql = require("mysql2/promise");
const secret_config = require("./secret_config");

// 데이터베이스 풀 생성
const pool = mysql.createPool({
	"host": process.env.DB_HOST_NAME,
	"user": process.env.DB_USER,
	"password" : process.env.DB_PASSWORD,
	"port" : process.env.DB_PORT,
	"database" : process.env.DB_DATABASE,
});

// 해당 pool을 다른 js파일에서 사용할 수 있도록 module화
module.exports = pool;