const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const multer = require('multer');
const multerS3 =require('multer-s3');
const path = require('path');
const { callbackify } = require("util");
const router = require('express').Router();


const s3 = require('../../config/s3'); //s3




/**---------- ASSIGN 파일 업로드 API ------------ */ 

//middleware
exports.uploadS3 = multer({ 
    storage: multerS3({
        s3: s3,
        bucket: 'ewhaspeakupsource1',
        key: (req, file, cb) =>{
            console.log(req.st_id, req.hw_id);
            const stID = req.st_id;
            const hwID = req.hw_id;
            cb(null, hwID + stID + path.extname(file.originalname))} //filename
        }),
    fileFilter: function(req, file, cb){
        var ext = path.extname(file.originalname);
        if (ext !== '.wav' && ext !== '.mp3'){
            return cb('Invalid File Extention : '+ ext + " >> please upload only audio file", null);
        }
        cb(null, true);
    }
});

//after middleware function
exports.uploadFile = async function ( req, res,err){ 
    console.log("here");
    const response_msg = {
        result : "done"
    };
    
    if (err){
        return res.json(response_msg);
    }
    return res.json(response_msg);
};



/**---------- 파일 다운로드 ------------ */


exports.transmitFile = function(req,res){
    var hw_id=req.body.hwid;
    var sql = "SELECT ORIGIN_VOICE FROM HOMEWORK WHERE HW_ID=?";
       pool.query(sql, [hw_id], function(err, result){
                  
          if(err) throw err;
          else{
                var result={
                    isSuccess : true,
                    code : 100,
                    message : "파일 수신에 성공했습니다.",
                    result : {filepath : result[0]['ORIGIN_VOICE']}
                };
                res.writeHead(200, {'Content-Type':'application/json/json'});
                res.end(JSON.stringify(result));
            }  
        });
};
