const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const multer = require('multer');
const path = require('path');
const { callbackify } = require("util");
const router = require('express').Router();

//AWS s3와 연결하기 위해 필요한 모듈
//const s3 = require('../../../config/s3');
//const multerS3 = require('multer-s3');


const upload = multer({
    storage:  multer.diskStorage({
        destination: function(req, file, cb){
            console.log("server: destination process...");
            cb(null, __dirname+'../../temp'); //파일 폴더
        },
        filename: function(req, file, cb){ //파일 이름
            //S3, DB 연동 후 해제
            //const userId = req.user_id;
            //const hwId = req.hw_id;
            console.log("server: filename process...");
            //const ext = path.extname(file.originalname);
            //const uploadFilename = path.basename(file.originalname, ext) + ext; // + '_' + hwId + '_' + userId + ext;
            cb(null, file.originalname);
        }
    })
    
});
/**
    fileFilter = function(req, file, cb){
        var ext = path.extname(file.originalname);
        if (ext !== '.wav' && ext !== '.mp3'){
            return cb(res.end('Invalid File Extention:'+ ext + " - please upload only audio file"), null);
        }
        cb(null, true);
    } */



router.post("/", upload.single('file'),(req,res)=>{
    res.send("done");
});

module.exports = router;
