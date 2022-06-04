const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');

router.route('/user')
    .post(async (req, res, next) => {
        try {
            const result = await user.signUp(req);
            return res.status(202).json({
                code: 202,
                message: '성공적으로 가입되었습니다.',
                result: result,
            });
        } catch(error) {
            if (error.message === 'Invalid Id') {
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.id}는 아이디 형식을 만족하지 않습니다.`,
                });
            } else if (error.message === 'Invalid Role') {
                return res.status(403).json({
                    code : 403,
                    message: `${req.body.role}은 올바르지 않은 역할입니다.`,
                });
            } else if (error.message === 'UserAlreadyExist Error') {
                return res.status(401).json({
                    code : 401,
                    message: `${req.body.id}는 이미 존재하는 아이디입니다.`,
                });
            }
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

module.exports = router;