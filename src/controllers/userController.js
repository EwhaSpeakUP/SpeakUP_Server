const {pool} = require('../../config/database');
const jwt = require('jsonwebtoken');
const auth = require("../../auth");
const crypto = require('crypto');
const { type } = require('os');
const jwtsecret = require('../../config/secret_config').jwtsecret;


/**---------- 회원가입 API ------------ */ 
exports.signUp = async function(req, res){
    const {id, password, st_id} = req.body;
    encoded_password = crypto.createHash('sha512').update(password).digest('base64');

    if (!id){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "아이디를 입력해주세요."
        });
    }
    if (!password){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "비밀번호를 입력해주세요."
        });
    }
    if (!st_id){
        return res.json({
            isSuccess: false,
            code: 302,
            message: "학번을 입력해주세요."
        });
    }
    else if (st_id.length != 7){
        return res.json({
            isSuccess: false,
            code: 303,
            message: "학번을 올바르게 입력해주세요(7자)."
        });
    }

    const connection = await pool.getConnection(function(err, conn){
        if(err){
            //conn.release();
            console.log(err);
            return res.json({
                isSuccess: false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다."
            });
        }
        const checkSTIDquery = 'select * from STUDENT where ST_ID = ?';
        var checkSTID = conn.query(checkSTIDquery, [st_id], function(err,rows){
            if(err){
                console.log(err);
                return res.json({
                    isSuccess: false,
                    code: 200,
                    message: "DB 서버 연결에 실패했습니다."
                });
            }
<<<<<<< HEAD
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
                message: "회원가입에 성공했습니다."
=======
            if (rows.length <= 0){
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 304,
                    message: "존재하지 않는 학번입니다."
                });
            }
            const checkSTquery = 'select * from USERS where STD_NUM = ?';
            conn.query(checkSTquery, [st_id], function(err,rows){
                if(err){
                    console.log(err);
                    return res.json({
                        isSuccess: false,
                        code: 200,
                        message: "DB 서버 연결에 실패했습니다."
                    });
                }
                if (rows.length > 0){
                    return res.json({
                        isSuccess: false,
                        code: 305,
                        message: "해당 학번에 계정이 이미 존재합니다."
                    });
                }
    
                const checkIDquery = 'select * from USERS where USER_ID = ?';
                conn.query(checkIDquery, [id], function(err, rows){
                    if(err){
                        console.log(err);
                        return res.json({
                            isSuccess: false,
                            code: 200,
                            message: "DB 서버 연결에 실패했습니다."
                        });
                    }
                    if(rows.length > 0){
                        return res.json({
                            isSuccess: false,
                            code: 306,
                            message: "중복되는 ID입니다."
                        });
                    }
                    
                    const addIDquery = 'insert into USERS(USER_ID, USER_PW, STD_NUM) values (?, ?, ?)';
                    conn.query(addIDquery, [id, encoded_password, st_id], function(err, rows){
                        if(err){
                            console.log(err);
                            return res.json({
                                isSuccess: false,
                                code: 200,
                                message: "DB 서버 연결에 실패했습니다."
                            });
                        }
                        
                        return res.json({
                            isSuccess: true,
                            code: 100,
                            message: "회원가입에 성공했습니다."
                        });
    
                    })
                    
                })
>>>>>>> 311f6831264c4e9fd4cbc212a2e52571c453f790
            });
        });
        
        
    });
}
    

/**---------- 로그인 API ------------ */ 
exports.signIn = async function(req, res){
    const {id, password} = req.body;
    encoded_password = crypto.createHash('sha512').update(password).digest('base64');
    if (!id){
        return res.json({
            isSuccess: false,
            code: 300,
            message: "아이디를 입력해주세요."
        });
    }
    if (!password){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "비밀번호를 입력해주세요."
        });
    }
    const connection = await pool.getConnection(function(err, conn){
        if (err){
            //conn.release();
            return res.json({
                isSuccess: false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다."
            });
        }

        const userinfoquery = 'select USER_INDEX,USER_ID, USER_PW, STD_NUM from USERS where USER_ID =?'
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
                    code: 302,
                    message: "아이디가 존재하지 않습니다."
                });
            }

            if(rows[0].USER_PW != encoded_password){
                console.log(rows[0].USER_PW + '  '+ encoded_password);
                conn.release();
                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "비밀번호가 올바르지 않습니다."
                });
            }

                    jwt.sign(
                      {
                        STD_NUM: rows[0].STD_NUM,
                      },
                      jwtsecret,
                      {
                        expiresIn: "10d",
                        issuer: "speakup_server.admin",
                        subject: "user.login.info",
                      },
                      function (err, token) {
                        res.json({
                            isSuccess: true,
                            code: 100,
                            message: "로그인에 성공했습니다.",
                            result: { access_token: token }
                        });
                    }
                );
            conn.release();
        });
    })   
;}