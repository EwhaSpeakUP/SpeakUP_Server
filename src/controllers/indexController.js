const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
//const { logger } = require('../../config/winston')

/**---------- AssignList API ------------ */ 
//input : Class_id
//output: 해당 Class에 포함된 과제ID, 과제 이름

exports.hwList = async function (req, res){
    
    const classId = req.params.classID;
    const assignListParams = [classId];
    
    const assignListQuery = " SELECT HW_ID, HW_NAME FROM HOMEWORK AS H WHERE H.CLASS_ID = ?";
    pool.query(assignListQuery, assignListParams, function(error, results, fields){
        if (error) throw error;
        else{
            return res.json({
                isSuccess : true,
                code: 100,
                message: "과제목록 수신에 성공했습니다.",
                result: {
                    hw_ids : results
                }
            });
        }
    });
};

/**---------- CourseList API ------------ */ 
//input : stID
//output: 해당 stID가 수강하는 과목 목록, 정보

exports.courseList = function(req,res){
    const connection = await pool.getConnection(function(err, conn){
    if (err) {
        return res.json({
            isSuccess : false,
            code: 200,
             message: "DB 서버 연결에 실패했습니다"
        });
    }
    var st_id =  req.params.stID;
    var sql = "SELECT * FROM COURSE WHERE COURSE_ID IN (SELECT COURSE_ID FROM COURSE_REGISTER WHERE ST_ID=?)";
    
    conn.query(sql, [st_id], function(err, result){
                
        if(err){
            conn.release();
            return res.json({
                isSuccess : false,
                code: 201,
                message: "DB 질의시 문제가 발생했습니다."
            });
        }
        if (rows.length < 1) {
            conn.release();
            return res.json({
                isSuccess : false,
                code: 202,
                message: "수강하는 과목이 없습니다."
            });
        }
        else{
                var result={
                    isSuccess : true,
                    code : 100,
                    message : "수업목록 수신에 성공했습니다.",
                    result : {courseList : result}
                };
                res.writeHead(200, {'Content-Type':'application/json/json'});
                res.end(JSON.stringify(result));
            }  
        });
    });
};
      