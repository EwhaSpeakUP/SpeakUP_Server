const { pool } = require('../../config/database');
//const { logger } = require('../../config/winston')

/**---------- AssignList API ------------ */ 
//input : Class_id
//output: 해당 Class에 포함된 과제ID, 과제 이름

exports.hwList = async function (req, res){
    const classId = req.class_id;

    try{ // try connection to DB
        const connection = pool.getConnection(conn => conn);
        try { // try query execution
            const assignListQuery = " SELECT HW_ID, HW_NAME FROM HOMEWORK AS H WHERE H.CLASS_ID = ?";
            const assignListParams = [classId];
            const [assignListRows] = await conn.query(assignListQuery, assignListParams);
            
            return res.json({
                isSuccess : true,
                code: 100,
                message: "과제목록",
                result: {
                    hw_ids : assignListRows
                }
            });    
        }
        catch(err){
            console.log(err);
            return res.json({
                isSuccess : false,
                code: 201,
                message: "DB 쿼리 수행에 문제가 있습니다.",
            });    
        }
    }
    catch (err) { // connection error
        return res.json({
            isSuccess : false,
            code: 200,
            message: "DB 연결에 실패했습니다."
        });
    }
};