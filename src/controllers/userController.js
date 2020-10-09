const {pool} = require('../../config/database');

exports.test = async function (req, res){
    const connection = await pool.getConnection(function (err,conn){
        if (err) return res.send(400);
        const sql = 'select * from STUDENT'
        conn.query(sql, [] ,function(err,rows){
            if(err){
                conn.release();
                return res.send(400, 'Couldnt get a connection');
            }
            res.send(rows);
            conn.release();
        });

    });
    
    
}
exports.signin = async function(req, res){
    const {id, password} = req.body;
    
    if (!id){
        return res.json({
            isSuccess: false,
            code: 200,
            message: "ID를 입력해주세요."
        });
    }
    if (!password){
        return res.json({
            isSuccess: false,
            code: 201,
            message: "PASSWORD를 입력해주세요."
        });
    }
    
    
;}