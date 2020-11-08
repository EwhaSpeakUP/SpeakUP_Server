// s3.js
// s3에 접근하기 위한 모듈 생성
const secret_config = require('./secret_config');
const AWS = require('aws-sdk');
//const multerS3 = require('multer-s3');  //multer middle ware 

const s3 = new AWS.S3({
    accessKeyId : secret_config.S3.AWS_ACCESS_KEY_ID,
    secretAccessKey : secret_config.S3.AWS_SECRET_ACCESS_KEY,
    region : secret_config.S3.AWS_REGION
});

module.exports = s3;