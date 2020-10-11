const jwt = require('jsonwebtoken');
const jwtsecret = require('./secret_config').jwtsecret;


exports.jwtMiddleWare = (req, res, next) =>{

    const token = req.body.token;
    if(!token){
        return res.status(403).json({
            isSuccess:false,
            code: 403,
            message: '로그인이 되어 있지 않습니다.'
        })
    }

    const p = new Promise(
    )



}