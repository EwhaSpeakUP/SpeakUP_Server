const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const token = req.headers["ourtoken"] || req.query.token;
  console.error("사용자가 전송한 토큰:",token);
  if (!token) {
    return res.status(403).json({
      server: "우리서버",
      success: false,
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
    console.log(error);
    res.status(403).json({
      server: "우리서버",
      success: false,
      message: error.message,
    });
  };

  p.then((decoded) => {
    req.decoded = decoded;
    next();
  }).catch(onError);
};

module.exports = authMiddleware;