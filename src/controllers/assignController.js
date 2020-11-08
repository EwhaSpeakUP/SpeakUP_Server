const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const { callbackify } = require("util");
const router = require('express').Router();

const S3 = require('../../config/s3'); //s3
const jwt = require("jsonwebtoken");
const {jwtsecret} = require('../../config/secret_config')
//const PythonShell = require('python-shell');

/**---------- 과제 업로드 API ------------ */ 

//after middleware function
exports.uploadAssign = async function (req, res){ 
    //학생정보 저장
    var jwt_token = req.headers.access_token; //헤더에 입력된 토큰
    var student_ID = jwt.decode(jwt_token, jwtsecret).STD_NUM;
    var there_was_error = false;
    
    for (var i=0 ; i < req.body.file.length ; i++){
        //body에 저장된 base64 처리 후, bytestring으로 변환
        var wav_bytestring= new Buffer.from(req.body.file[i], 'base64');
        
        
        //python으로 보낸다. >> 추가해야함
        

        //S3에 각 음성파일 저장
        var param = {
            'Bucket': 'ewhaspeakupsource1/hw_assign',
            'Key' : req.params.assignID + '_' + student_ID + '_'+ (i+1) + '.wav', // 과제id_student_id로 저장
            'ACL' : 'public-read',
            'Body': wav_bytestring,// wav bytestring
            'ContentType': 'audio/wav'
        }
        
        S3.upload(param,(err, data)=>{
            if(err) {
                console.log(err);
                there_was_error = true;
                console.log(there_was_error);
                return res.json({
                    isSuccess: false,
                    code: 100,
                    message: "업로드 중 문제가 발생했습니다."
                });
                
            }
            console.log(data);
            
        });
    }
    if (there_was_error == false){
        return res.json({
            isSuccess: true,
            code: 200,
            message: "과제 업로드에 성공했습니다."
        });
    }

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


