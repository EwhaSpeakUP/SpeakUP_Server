const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
const jwtsecret = require('../../config/secret_config').jwtsecret;
//const { logger } = require('../../config/winston')

/**---------- AssignList API ------------ */ 
//input : Class_id, jwt(학번식별)
//output: 해당 Class에 포함된 과제ID, 과제 이름, due_date

exports.assignList = async function (req, res){
    const connection = await pool.getConnection(function(err, conn){
        if (err) {
            console.log("here");
            return res.json({
                isSuccess : false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다"
            });
        }
        const token = req.body.token;
        const studentId = "1771014"; // 임시 변수 값. jwt 값으로 알아내야함.
        const courseId = req.params.courseId;

        const checkRegisterQuery = "SELECT * FROM COURSE_REGISTER WHERE ST_ID = ? AND COURSE_ID = ?";
        conn.query(checkRegisterQuery, [studentId, courseId], (err, rows) => {
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
                    message: "해당 수업을 수강하지 않습니다."
                });
            }
            const assignListQuery = "SELECT COURSE_ID, ASSIGNMENT_NAME, DUE_DATE, SUBMIT_CHECK FROM ASSIGNMENT AS A, SUBMIT_ASSIGNMENT AS SA WHERE SA.ASSIGNMENT_ID = A.ASSIGNMENT_ID AND (A.COURSE_ID = ? AND SA.ST_ID = ?);"; //순서 중요 **
            const assignListParams = [courseId, studentId]; // 순서 중요**
            conn.query(assignListQuery, assignListParams, function(err, rows){
                if(err){
                    return res.json({
                        isSuccess : false,
                        code: 201,
                        message: "DB 질의시 문제가 발생했습니다."
                    });
                }
                if (rows.length >= 1){
                    return res.json({
                        isSuccess : true,
                        code: 100,
                        message: "과제목록 수신에 성공했습니다.",
                        result: {
                            courses : rows
                        }
                    });
                } else{
                    return res.json({
                        isSuccess : true,
                        code: 101,
                        message: "과제목록이 비어있습니다."
                    });
                }
            });
        });
        
        
    });
};

/**---------- ClassList API ------------ */ 
//input : Class_id
//output: 해당 Class에 포함된 과제ID, 과제 이름

exports.courseList = function(req,res){
    var st_id =  req.params.stID;
  
    var sql = "SELECT * FROM COURSE WHERE COURSE_ID IN (SELECT COURSE_ID FROM COURSE_REGISTER WHERE ST_ID=?)";
    
      pool.query(sql, [st_id], function(err, result){
                
        if(err) throw err;
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
};
      