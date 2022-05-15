const { pool } = require('../../config/database');
const jwt = require('jsonwebtoken');
const auth = require("../../auth");
const crypto = require('crypto');
const { type } = require('os');
/**
 * 회원가입 API
 * @Body {string} id 
 * @Body {string} password 
 * @Body {Number} studentId 
 * @returns 
 */
const validateSignUpInput = (id, password, studentId) => {
    if (!id || !password || !studentId || studentId.length != 7){
        return false;
    } else  {
        return true;
    }
}

exports.signUp = async function(req, res) {
    const {id, password, studentId} = req.body;

    // 입력 확인
    if (!validateSignUpInput(id, password, studentId)) {
        return res.status(400).json({
            isSuccess: false,
            message: "아이디, 패스워드, 혹은 학번 형식이 알맞지 않습니다.",
        });
    }

    try {
        const conn = await pool.getConnection(async conn => conn);

        // 해당 학번이 존재하는지 확인
        const checkStudentIdQuery = 'select * from STUDENT where ST_ID = ?';
        let checkStudentIdRows = await conn.query(checkSTIDquery, [studentId]);
        if (checkStudentIdRows.length <= 0){
            conn.release();
            return res.status(400).json({
                isSuccess: false,
                message: "존재하지 않는 학번입니다.",
            });
        }

        // 해당 학번으로 가입된 계정이 존재하는지 확인
        const checkStudentAccountQuery = 'select * from USERS where STD_NUM = ?';
        const checkStudentAccountRows = await conn.query(checkStudentAccountQuery, [studentId]);
        if (checkStudentAccountRows > 0) {
            conn.release();
            return res.status(400).json({
                isSuccess: false,
                message: "해당 학번으로 가입된 계정이 있습니다.",
            });
        }

        // 입력한 아이디가 중복되는 아이디인지 확인
        const checkIdQuery = 'select * from USERS where USER_ID = ?';
        const checkIdRows = await conn.query(checkIdQuery, [id]);
        if(checkIdRows > 0) {
            conn.release();
            return res.status(400).json({
                isSuccess: false,
                message: "중복되는 ID입니다.",
            });
        }

        // 회원 가입
        const encoded_password = crypto.createHash('sha512').update(password).digest('base64');
        const createAccountQuery = 'insert into USERS(USER_ID, USER_PW, STD_NUM) values (?, ?, ?)';
        await conn.query(createAccountQuery, [id, encoded_password, st_id]);
        return res.status(202).json({
            isSuccess: true,
            message: "회원가입에 성공했습니다.",
        })
    } catch (e) {
        return res.status(500).json({
            isSuccess: false,
            message: "서버에 문제가 발생하였습니다.",
        });
    }
}
    
/**
 * 로그인 API
 * @Body {*} id
 * @Body {*} password
 * @returns 
 */
const getToken = (payload, secret, option) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            secret,
            option,
            function (err, token) {
                if (err) reject(err);
                else resolve(token);
            }
        )
    })
}

const validateSignInInput = (id, password) => {
    if(!id || !password) return false;
    else return true;
}

exports.signIn = async function(req, res){
    const { id, password } = req.body;
    

    if(!validateSignInInput(id, password)) {
        return res.status(400).json({
            isSuccess: false,
            message: "아이디, 패스워드 형식이 올바르지 않습니다.",
        });
    }
    
    try {
        const conn = await pool.getConnection(async conn => conn);

        // 사용자 정보 조회 후
        const userInfoQuery = 'select USER_INDEX,USER_ID, USER_PW, STD_NUM from USERS where USER_ID =?';
        const userInfoRows = await conn.query(userInfoQuery, [id]);
        if(userInfoRows.length < 1){
            conn.release();
            return res.status(409).json({
                isSuccess: false,
                message: "존재하지 않는 아이디입니다.",
            })
        }

        const encoded_password = crypto.createHash('sha512').update(password).digest('base64');
        if(userInfoRows[0].USER_PW != encoded_password){
            conn.release();
            return res.status(409).json({
                isSuccess: false,
                message: "패스워드가 일치하지 않습니다."
            });
        }
        const token = await getToken(
            {
                studentId: userInfoRows[0].STD_NUM,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10d",
                issuer: "speakup_server.admin",
                subject: "user.login.info",
            }
        );
        return res.status(202).json({
            isSuccess: true,
            message: "로그인에 성공했습니다.",
            result: { access_token: token }
        })

    } catch(e) {
        return res.status(500).json({
            isSuccess: false,
            message: "서버에 문제가 발생하였습니다.",
        });
    };
}
