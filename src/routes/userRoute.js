const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');

router.route('/user')
    .post(async (req, res, next) => {
        try {
            const {id, role, password, name,} = req.body;
            const result = await user.signUp(id, role, password, name);
            
            return res.status(202).json({
                code: 202,
                message: '성공적으로 가입되었습니다.',
                result: result,
            });
        } catch(error) {
            if (error.message === 'Invalid Id') {
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.id}은(는) 아이디 형식을 만족하지 않습니다.`,
                });
            }
            if (error.message === 'Invalid Role') {
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.role}은(는) 올바르지 않은 역할입니다.`,
                });
            }
            if (error.message === 'UserAlreadyExist Error') {
                return res.status(401).json({
                    code : 401,
                    message: `${req.body.id}은(는) 이미 존재하는 아이디입니다.`,
                });
            }

            console.error(error);
            return res.json({
                code: 401,
                message: '회원가입에 실패했습니다.',
            })
        }
    })
    
    //module.exports = = function(app){
    //const user = require('../controllers/userController');
    
    
    
    //app.post("/login", user.signIn);
    //app.post("/user", user.signUp);
//}
router.route('/login')
    .post(async (req, res, next) => {
        try {
            const {id, password} = req.body;
            const loginToken = await user.signIn(id, password);
            return res.status(202).json({
                code: 202,
                message: '성공적으로 로그인되었습니다.',
                result : {
                    token : loginToken,
                }
            })
        } catch(error) {
            if (error.message === 'Empty Input') {
                return res.status(403).json({
                    code : 403,
                    message: `아이디, 패스워드를 입력해주세요.`,
                });
            }
            if (error.message === 'Invalid Input'){
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.id}은(는) 아이디 형식을 만족하지 않습니다.`,
                });
            }
            if (error.message === 'Not Registered Id') {
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.id}은(는) 가입되지 않은 아이디입니다.`,
                });
            }
            if (error.message === 'Incorrect Password') {
                return res.status(403).json({
                    code : 403,
                    message: `패스워드가 일치하지 않습니다.`,
                });
            }

            console.error(error);
            return res.json({
                code: 401,
                message: '로그인에 실패했습니다.',
            })
        }
    })

module.exports = router;