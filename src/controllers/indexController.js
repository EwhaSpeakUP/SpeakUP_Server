const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
//const { logger } = require('../../config/winston')

/**---------- AssignList API ------------ */ 
//input : Class_id
//output: 해당 Class에 포함된 과제ID, 과제 이름

exports.hwList = async function (req, res){
    
    const classId = req.body.class_id;
    const assignListParams = [classId];

    const assignListQuery = " SELECT HW_ID, HW_NAME FROM HOMEWORK AS H WHERE H.CLASS_ID = ?";
    pool.query(assignListQuery, assignListParams, function(error, results, fields){
        if (error) throw error;
        else{
            return res.json({
                isSuccess : true,
                code: 100,
                message: "과제목록",
                result: {
                    hw_ids : results
                }
            });
        }
    });
};

