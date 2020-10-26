const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
const jwtsecret = require('../../config/secret_config').jwtsecret;
const jwt = require("jsonwebtoken");
const auth = require("../../auth");


exports.login = async function(req,res){
    const connection = await pool.getConnection(function(err, conn){
    if (err) {
        return res.json({
            isSuccess : false,
            code: 200,
             message: "DB 서버 연결에 실패했습니다"
        });
    }
    var user_id =  req.params.userID;
    var user_password = req.params.userPW;
    var sql = "SELECT * FROM users WHERE ID = ?";
    conn.query(sql, [user_id], function(err, result){
                
        if(err){
            conn.release();
            return res.json({
                isSuccess : false,
                code: 201,
                message: "DB 질의시 문제가 발생했습니다."
            });
        }
        if (result.length < 1) {
            conn.release();
            return res.json({
                isSuccess : false,
                code: 202,
                message: "등록되지 않은 아이디 입니다."
            });
        }
        else{
                var db_password=results[0].pass;
                console.log("hi");
                if (user_password == db_password) {
                    var tokenKey = "fintech";
                    jwt.sign(
                      {
                        userId: results[0].ID,
                      },
                      tokenKey,
                      {
                        expiresIn: "10d",
                        issuer: "fintech.admin",
                        subject: "user.login.info",
                      },
                      function (err, token) {
                        console.log("로그인 성공", token);
                        res.json(token);
                      }
                    );
                  } else {
                    res.json("비밀번호가 다릅니다!");
                  }
                
            }  
        });
    });
};
      