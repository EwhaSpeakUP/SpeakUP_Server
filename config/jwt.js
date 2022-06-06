const jwt = require('jsonwebtoken');

module.exports = {
    sign : function(obj){
        return jwt.sign(obj, process.env.JWTSECRET_LOGIN);
    },

    verify : function(token, secret) {
        return new Promise((resolve, reject)=> {
            jwt.verify(token, secret, (error, decode) => {
                if(error) return reject(error);
                resolve(decode);
            })
        })
    }
}
/**
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
} */