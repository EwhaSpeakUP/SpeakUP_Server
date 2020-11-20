const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const { callbackify } = require("util");
const router = require('express').Router();

const S3 = require('../../config/s3'); //s3
const jwt = require("jsonwebtoken");
const {jwtsecret} = require('../../config/secret_config')
const PythonShell = require('python-shell');
const fs = require('fs');
const { stringify } = require("querystring");
/**전사결과 API */

// S3에 html파일 없다 (전사파일이 없다)
//              s3에 저장되 json파일을 가지고 전사파일을 만든다.
//              s3저장 async
// HTML파일을 RES로 보낸다.

/**---------- 과제 업로드 API ------------ */ 

function uploadS3(S3params, addVoiceUrlQueryParams,conn, res){
    const promise = new Promise((resolve, reject) => {
        S3.upload(S3params, (err, data)=>{
            if(err) {
                console.log(err);
                there_was_error = true;
                console.log(there_was_error);
                reject();
                return res.json({
                    isSuccess: false,
                    code: 100,
                    message: "버킷 저장 중 문제가 발생했습니다."
                });   
            }     
        });
        addVoiceUrlQuery = 'UPDATE SUBMIT_ASSIGNMENT SET SUBMIT_VOICE = CONCAT(SUBMIT_VOICE,"|?") WHERE ST_ID=? AND ASSIGNMENT_ID = ?';
        
        conn.query(addVoiceUrlQuery, addVoiceUrlQueryParams, (err, result)=>{
            if(err){
                console.log(err);
                reject();
                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "DB 질의시 문제가 발생했습니다."
                });
            }
        });
        resolve();
    });
    return promise;
}

//function
exports.uploadAssign = async function (req, res){ 
    //학생정보 저장
    var jwt_token = req.headers.access_token; //헤더에 입력된 토큰
    var student_ID = jwt.decode(jwt_token, jwtsecret).STD_NUM;
    var there_was_error = false;
    pool.getConnection((err, conn)=> {
        if(err){
            console.log(err);
            return res.json({
                isSuccess: false,
                code: 300,
                message: "DB 서버 연결에 실패했습니다."
            });
        }
        else{
            for (var i=0 ; i < req.body.files.length ; i++){
                var voice_index = i+1;
                var audio_bytestring= new Buffer.from(req.body.files[i], 'base64');
                fs.writeFileSync('src\\Transcription\\audio_file'+ String(voice_index)+'.mp3', audio_bytestring);
                
                var options = {
                    mode: 'text',
                    pythonPath: 'C:\\Users\\Maeg\\Anaconda3\\python.exe',
                    pythonOptions: ['-u'],
                    scriptPath: './src/Transcription',
                    args: [req.params.assignID, student_ID, voice_index]
                  };
                
                PythonShell.PythonShell.run('Transcription.py',options, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    console.log("Transcript::"+ result);
                })
                
                //S3에 각 음성파일 저장
                var bucketname = 'ewhaspeakupsource1';
                var voiceFilePath = 'hw_assign/'+req.params.assignID+'/'+student_ID+ '/' + "voice_"+(i+1)+".wav";
                var url = "https://"+bucketname+".s3.ap-northeast-2.amazonaws.com/" + voiceFilePath;
                var S3Params = {
                    'Bucket': bucketname,
                    'Key' : voiceFilePath,
                    'ACL' : 'public-read',
                    'Body': audio_bytestring,
                    'ContentType': 'audio/wav'
                }
                var addVoiceUrlQueryParams = [url, student_ID, req.params.assignID];
                uploadS3(S3Params, addVoiceUrlQueryParams, conn,res);
            }
        }
        return res.json({
            isSuccess: true,
            code: 200,
            message: "과제 업로드에 성공했습니다."
        });
        
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
