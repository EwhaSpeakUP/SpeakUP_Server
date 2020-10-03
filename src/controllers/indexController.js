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
      