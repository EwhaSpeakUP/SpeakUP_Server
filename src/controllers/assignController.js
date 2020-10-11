const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const multer = require('multer');
const multerS3 =require('multer-s3');
const path = require('path');
const { callbackify } = require("util");
const router = require('express').Router();


const s3 = require('../../config/s3'); //s3




/**---------- 과제 업로드 API ------------ */ 

//middleware for file uploading
exports.uploadS3 = multer({ 
    storage: multerS3({
        s3: s3,
        bucket: 'ewhaspeakupsource1/hw_assign', // 버켓이름 + 폴더 path
        key: function(req, file, cb){
            const studentID = req.params.stID;
            const assignID = req.params.hwID;
            cb(null, assignID + "_" + studentID + path.extname(file.originalname))} //filename
        }),
    fileFilter: function(req, files, cb){
        var ext = path.extname(files.originalname);
        if (ext !== '.wav' && ext !== '.mp3'){
            return cb('Invalid File Extention : '+ ext + " >> please upload only audio file", null);
        }
        cb(null, true);
    },
    acl : 'public-read-write'
});

//after middleware function
exports.uploadAssign = async function (req, res){ 

    return res.json({
        isSuccess: true,
        code: 100,
        message: "과제 업로드에 성공했습니다."
    });
};


/**---------- 파일 다운로드 ------------ */


exports.transmitFile = async function(req,res){
    const connection = await pool.getConnection(function(err, conn){
        if(err) {
            console.log("here");
            return res.json({
                isSuccess : false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다"
            });
        }
        var assign_id = req.params.assignID;
        var sql = "SELECT ORIGIN_VOICE FROM ASSIGNMENT WHERE ASSIGNMENT_ID=?";
        conn.query(sql, [assign_id], function(err, result){
                  
        if(err){
            conn.release();
            return res.json({
                isSuccess : false,
                code: 201,
                message: "DB 질의시 문제가 발생했습니다."
            });
        }
        if (result.length < 1) {
            conn.release();
            return res.json({
                isSuccess : false,
                code: 202,
                message: "해당하는 과제가 없습니다."
            });
        }
          else{
                var file_link=result[0]["ORIGIN_VOICE"].split('|');;
                var result={
                    isSuccess : true,
                    code : 100,
                    message : "파일 수신에 성공했습니다.",
                    result : {filepath : file_link}
                };
                res.writeHead(200, {'Content-Type':'application/json/json'});
                res.end(JSON.stringify(result));
            }  
        });
    });
};
