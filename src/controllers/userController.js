const {pool} = require('../../config/database');
const jwt = require('jsonwebtoken');
const jwtsecret = require('../../config/secret_config').jwtsecret;
exports.test = async function (req, res){
    
    const connection = await pool.getConnection(function (err,conn){
        if (err) return res.send(400);
        const sql = 'select * from STUDENT'
        conn.query(sql, [] ,function(err,rows){
            if(err){
                conn.release();
                return res.send(400, 'Couldnt get a connection');
            }
            res.send(rows);
            conn.release();
        });

    });

}
/**---------- 회원가입 API ------------ */ 
exports.signUp = async function(req, res){
    const {id, password, st_id} = req.body;
    if (!id){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "ID를 입력해주세요."
        });
    }
    if (!password){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "PASSWORD를 입력해주세요."
        });
    }
    const connection = await pool.getConnection(function(err, conn){
        if(err){
            conn.release();
            return res.json({
                isSuccess: false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다."
            });
        }

        const checkSTquery = 'select * from users where student_number = ?';
        const checkSTrows = conn.query(checkSTquery, [st_id], function(err,rows){
            if(err){
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 200,
                    message: "DB 서버 연결에 실패했습니다."
                });
            }
            return rows;
        });
        if(checkSTrows.length > 0){
            if (rows[0].ID == id)
            conn.release();
            return res.json({
                isSuccess: false,
                code: 200,
                message: "이미 존재하는 ID입니다."
            });
        }
        else{
            conn.release();
            return res.json({
                isSuccess: false,
                code: 200,
                message: "성공"
            });
        }
    }

}


/**---------- 로그인 API ------------ */ 
exports.signIn = async function(req, res){
    const {id, password} = req.body;
    if (!id){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "ID를 입력해주세요."
        });
    }
    if (!password){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "PASSWORD를 입력해주세요."
        });
    }
    const connection = await pool.getConnection(function(err, conn){
        if (err){
            conn.release();
            return res.json({
                isSuccess: false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다."
            });
        }

        const userinfoquery = 'select user_index,ID, pass, st_id from users where ID =?'
        const userinfoparams = [id];
        conn.query(userinfoquery, userinfoparams, function(err, rows){
            if(err){
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 200,
                    message: "DB 서버 연결에 실패했습니다."
                });
            }
            
            if(rows.length < 1){
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 200,
                    message: "ID가 존재하지 않습니다."
                });
            }

            if(rows[0].pass !== password){
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 200,
                    message: "Password가 올바르지 않습니다."
                });
            }

            let token = await jwt.sign(
                {
                index: rows[0].user_index,
                id: id,
                password: password,
                st_id : rows[0].st_id
                },
                jwtsecret,
                {
                    expiresIn:"10d",
                    subject: "userinfo"
                }
            ); 
            
            res.json({
                isSuccess: true,
                code: 100,
                result: { jwt: token },
                message: "로그인 성공"
            });
            conn.release();
        });
        

    })
    
    
;}