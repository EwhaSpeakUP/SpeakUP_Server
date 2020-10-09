const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
//const { logger } = require('../../config/winston')

/**---------- AssignList API ------------ */ 
//input : Class_id, jwt(학번식별)
//output: 해당 Class에 포함된 과제ID, 과제 이름, due_date

exports.hwList = async function (req, res){
    const connection = await pool.getConnection(function (err,conn){
        if (err) {
            return res.json({
                isSuccess : false,
                code: 200,
                message: "DB 서버 연결에 실패했습니다"
            });
        }
        
        const classId = req.params.classId;
        const studentId = "1771014"; // 임시 변수 값. jwt 값으로 알아내야함.
        const assignListParams = [classId, studentId]; // 순서 중요**
        const assignListQuery = "SELECT COURSE_ID, ASSIGNMENT_NAME, DUE_DATE, SUBMIT_CHECK FROM ASSIGNMENT AS A, SUBMIT_ASSIGNMENT AS SA WHERE SA.ASSIGNMENT_ID = A.ASSIGNMENT_ID AND (A.COURSE_ID = ? AND SA.ST_ID = ?);"; //순서 중요 **
        
        conn.query(assignListQuery, assignListParams, function(err, rows){
            if(err){
                conn.release();
                return res.json({
                    isSuccess : false,
                    code: 201,
                    message: "DB 질의시 문제가 발생했습니다."
                });
            }

            if (rows.length >= 1){
                res.json({
                    isSuccess : true,
                    code: 100,
                    message: "과제목록 수신에 성공했습니다.",
                    result: {
                        courses : rows
                    }
                });
            } else{
                res.json({
                    isSuccess : true,
                    code: 101,
                    message: "과제목록이 비어있습니다."
                });
            }
            conn.release();
            return;
        });

    });
};

/**---------- ClassList API ------------ */ 
//input : Class_id
//output: 해당 Class에 포함된 과제ID, 과제 이름

exports.classList = function(req,res){
    var std_num =  req.params.stdNUM;
  
    var sql = "SELECT * FROM CLASS WHERE CLASS_ID IN (SELECT CLASS_ID FROM CLASS_REGISTER WHERE ST_ID=?)";
    
      pool.query(sql, [std_num], function(err, result){
                
        if(err) throw err;
        else{
                var result={
                    isSuccess : true,
                    code : 100,
                    message : "수업목록 수신에 성공했습니다.",
                    result : {classList : result}
                };
                res.writeHead(200, {'Content-Type':'application/json/json'});
                res.end(JSON.stringify(result));
            }  
        });
};
      