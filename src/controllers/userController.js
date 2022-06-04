const jwt = require('jsonwebtoken');
//const auth = require("../../auth");
const crypto = require('crypto');
//const { type } = require('os');
//const jwtsecret = require('../../config/secret_config').jwtsecret;
const User = require('../../models/user');
const Student = require('../../models/student');
const Professor = require('../../models/professor');

/**---------- 회원가입 API ------------ */ 
exports.signUp = async function(req){
    const {id, role, password, name,} = req.body;
    
    /** 입력 확인 */
    if (id.toString().length != 7) {
        throw new Error('Invalid Id');
    }
    if (role !== 'professor' && role !== 'student'){
        throw new Error('Invalid Role');
    }

    const encoded_password = crypto.createHash('sha512').update(password).digest('base64');
    try {
        /** 해당 학번, 교번에 해당하는 사용자가 있다면, 회원가입이 되지 않는다. */
        const exuser = await User.findOne({ where : {id}});
        if (exuser) {
            throw new Error('UserAlreadyExist Error');
        };

        /** 회원 가입 */
        let is_student_val;
        let is_professor_val;

        if (role === 'student') {
            is_student_val = true;
            is_professor_val = false;
        } else if ( role === 'professor' ){
            is_student_val = false;
            is_professor_val = true;
        }
        const user = await User.create({
            id :id,
            isStudent: is_student_val,
            isProfessor: is_professor_val,
            password: encoded_password,
            info : ''
        });

        if (role === 'student') {
            const student = await Student.create({
                studentId : id,
                name : name,
                year : '1',
            });
            return student;
        } else if ( role === 'professor' ){
            const professor = await Professor.create({
                professorId : id,
                name : name,
            });
            return professor;
        }
    } catch(error) {
        throw error;
    } 

}
    

/**---------- 로그인 API ------------ 
exports.signIn = async function(req, res){
    console.log("API execution: SignIN");
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
            console.log(err);//TransportOptions.//conn.release();
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
                console.log(err);
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
                        if(err){
                            console.log(err);
                        }
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
;}*/ 