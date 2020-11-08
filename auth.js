const jwt = require("jsonwebtoken");
const jwtsecret = require('./config/secret_config').jwtsecret;
const authMiddleware = (req, res, next) => {
  const token = req.headers["access_token"] || req.query.token;
  console.error("사용자가 전송한 토큰:",token);
  if (!token) {
    return res.json({
      isSuccess: false,
      code: 403,
      message: "로그인되지 않은 상태입니다.",
    });
    
  }

  const p = new Promise((resolve, reject) => {
    jwt.verify(token, jwtsecret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });

  const onError = (error) => {
    return res.json({
      isSuccess: false,
      code: 403,
      message: "유효하지 않은 토큰입니다.",
    });
  };

  p.then((decoded) => {
    req.decoded = decoded;
    next();
  }).catch(onError);
};

module.exports = authMiddleware;