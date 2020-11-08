const AWS = require('aws-sdk');
const fs = require('fs');
const S3 = require('./config/s3');
//app.post("/assign/:assignID", assign.uploadS3.array('file'),assign.uploadAssign); // 통역 음성 업로드 (학생)
exports.uploadAssign = async function (req, res){ 
    
    
    //base64 처리 후, bytestring으로 변환

    //python으로
    
    // S3에 wav파일 저장
    var params = {
        'Bucket': 'ewhaspeakupsource1/hw_assign',
        'Key' : req.params.assignID + '_' + req.,
        'ACL' : 'public-read',
        'Body': 
        'ContentType': 'audio/wav'
    }


    return res.json({
        isSuccess: true,
        code: 100,
        message: "과제 업로드에 성공했습니다."
    });
};