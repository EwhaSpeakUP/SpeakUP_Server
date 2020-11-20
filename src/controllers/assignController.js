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

//after middleware function
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


/**---------- 연사 음성 파일 다운로드 ------------ */


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
                var file_link=result[0]["ORIGIN_VOICE"].split('|');
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




/**---------- 전사 및 통계 결과 확인 ------------ */


exports.viewResult = async function(req,res){
    var chk_num=0;

    var assign_id=req.params.assignID;
    var jwt_token = req.headers.access_token; 
    var student_id = jwt.decode(jwt_token, jwtsecret).STD_NUM;
    var BUCKET_NAME = 'ewhaspeakupsource1';
    var sql = "SELECT TRANSCRIPT, STATISTICS FROM SUBMIT_ASSIGNMENT WHERE ASSIGNMENT_ID=? AND ST_ID = ?";

    /**전사 파일 API */
//S3에서 파일 목록 읽어오기
function getJSONnum(params, dir){
    const promise = new Promise((resolve, reject)=>{
        S3.listObjects(params, function (err, data) {
            
            if(err) reject(err);
            var num = 0;
            var json_arr=[];
            var len = data.Contents.length;
            for(var i=0; i<len; i++){
                var str=data.Contents[i].Key;
                var c = str.replace('hw_assign/'+dir , '');
                if(c.startsWith('JSON')){
                    json_arr.push(c);
                    num=num+1;
                    console.log('s3://ewhaspeakupsource1/hw_assign/'+dir+c);
                    var param = {Bucket:BUCKET_NAME, Key : 'hw_assign/'+dir+c};
                    var file = require('fs').createWriteStream(c);
                    S3.getObject(param).createReadStream().pipe(file); //json 파일 저장
                }
            }
            resolve([num, json_arr]);
        });
    })
    return promise;
}

    const connection = await pool.getConnection(function(err, conn){
        conn.query(sql, [assign_id, student_id], function(err, result){       
            if(err){
                conn.release();
                return res.json({
                    isSuccess : false,
                    code: 200,
                    message: "DB 서버 연결에 실패했습니다."
                });
            }
            //전사파일이 없을 경우에는 전사파일 생성
            if(JSON.stringify(result[0].TRANSCRIPT)=='null'){ 
                var html_arr=[]; 
                var sta_arr=[0,0,0,0,0,0,0];

                //동기를 위한 readJSON 함수 정의
                function readJSON(json, callback){
                    fs.readFile( json, 'utf8', function (err, data) {
                        var result = "<html><head><title>결과</title></head><body>"
                        var model_result = JSON.parse(data);
                        var item = model_result["결과"];
                        var sta_json = model_result["통계결과"];
            
                        sta_arr[0]+=parseInt(sta_json["음"]); sta_arr[1]+=parseInt(sta_json["그"]); sta_arr[2]+=parseInt(sta_json["어"]); sta_arr[3]+=parseInt(sta_json["총 개수"]);
                        sta_arr[4]+=parseFloat(sta_json["발화시간"]); sta_arr[5]+=parseFloat(sta_json["침묵시간"]); sta_arr[6]+=parseFloat(sta_json["통역개시지연시간"]); 
                        for(var j=0; j<item.length; j++){
                            if (item[j]["tag"]=="0000") {result+="<font size=1 color=blue>"; result+=item[j]["result"]; result+=" </font>";}
                            else if (item[j]["tag"]=="1000") {result+="<font size=3 color=black>"; result+=item[j]["result"]; result+=" </font>";}
                            else if (item[j]["tag"]=="1001") {result+="<font size=3 color=red>"; result+=item[j]["result"]; result+=" </font>";}
                        }
                        result+="</body></html>";
                        if(err) return callback(err);
                        callback(null, result);
                    });
                }
            
                
                function mk_html(num, json_arr, callback){
                    for (var i=0; i<num; i++){   //num:JSON 파일 갯수 -->JOSN 파일 돌때마다
                        readJSON(json_arr[i], function(err, result){
                            html_arr.push(result); 
                            callback(null, html_arr, sta_arr);
                        })
                    }
                }   
            
                
                var num=0;
                var dir=assign_id+'/'+student_id+'/';
                var params = { 
                    Bucket: BUCKET_NAME,
                    Delimiter: '',
                    Prefix: 'hw_assign/'+dir 
                }
                
                // S3에서 JSON파일의 개수를 알아낸다
                getJSONnum(params,dir)
                .then(([num, json_arr])=>{
                    mk_html(num,json_arr, function (err, html_arr, sta_arr){
                        chk_num++;
                        /** DB에 전사파일 정보 저장 */
                        var sql = "UPDATE SUBMIT_ASSIGNMENT SET TRANSCRIPT = ? WHERE ASSIGNMENT_ID = ? AND ST_ID = ?";
                        conn.query(sql, [html_arr.join('$$$$'), assign_id,student_id], function(err, rows){
                            if(err){
                                console.log(err);
                                return res.json({
                                    isSuccess : false,
                                    code: 201,
                                    message: "DB 질의시 문제가 발생했습니다."
                                });
                            }                      
                        });
                        
                        /** DB에 통계 정보 저장 */
                        var sql = "UPDATE SUBMIT_ASSIGNMENT SET STATISTICS = ? WHERE ASSIGNMENT_ID = ? AND ST_ID = ?";
                        console.log(sta_arr);
                        conn.query(sql, [sta_arr.join(','),assign_id, student_id], function(err, rows){
                            if(err){
                                console.log(err);
                                conn.release();
                                return res.json({
                                    isSuccess : false,
                                    code: 201,
                                    message: "DB 질의시 문제가 발생했습니다."
                                });
                            }      
                        });
                        if(chk_num==num){
                            var result={
                                isSuccess : true,
                                code : 100,
                                message : "파일 수신에 성공했습니다.",
                                result : {html : "["+html_arr.join(',')+"]", statistics : "["+sta_arr.join(',')+"]" }
                            };
                            res.writeHead(200, {'Content-Type':'application/json/json'});
                            res.end(JSON.stringify(result));
                        }
                    });
                });
            }
            /** DB에 전사파일이 있는 경우에는 바로 송신*/
            else{
                var result={
                    isSuccess : true,
                    code : 100,
                    message : "파일 수신에 성공했습니다.",
                    result : {html : "["+result[0]["TRANSCRIPT"].split('$$$')+"]", statistics : "["+result[0]["STATISTICS"]+"]" }
                };
                res.writeHead(200, {'Content-Type':'application/json/json'});
                res.end(JSON.stringify(result));
            }
        });
    });
}
