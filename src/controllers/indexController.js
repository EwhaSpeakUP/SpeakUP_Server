
const jwt = require("jsonwebtoken");
const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
const jwtsecret = require('../../config/secret_config').jwtsecret;
//const { logger } = require('../../config/winston')

/**
 * 과제리스트 API : 특정 강의에 대한 과제 리스트 반환
 * @Body {*} courseId
 * @Header {*} Token
 * @returns assignList
 */
exports.assignList = async function (req, res){
    const jwtToken = req.headers.access_token;
    const studentId = jwt.decode(jwtToken, process.env.JWT_SECRET).studentId;
    const courseId = req.params.courseId;

    try {
        const conn = await pool.getConnection(conn => conn);

        // 강의 수강 여부 확인
        const checkRegisterQuery = "SELECT * FROM COURSE_REGISTER WHERE ST_ID = ? AND COURSE_ID = ?";
        const checkRegisterRows = await conn.query(checkRegisterQuery, [studentId, courseId]);
        if (checkRegisterRows.length < 1) {
            conn.release();
            return res.status(409).json({
                isSuccess : false,
                message: "해당 수업을 수강하지 않습니다.",
            });
        }

        // 과제 리스트를 반환
        const getAssignListQuery = "SELECT COURSE_ID, A.ASSIGNMENT_ID, ASSIGNMENT_NAME, DUE_DATE, SUBMIT_CHECK FROM ASSIGNMENT AS A, SUBMIT_ASSIGNMENT AS SA WHERE SA.ASSIGNMENT_ID = A.ASSIGNMENT_ID AND (A.COURSE_ID = ? AND SA.ST_ID = ?);"; //순서 중요 **
        const getAssignListRows = await conn.query(getAssignListQuery, [courseId, studentId]);
        if (getAssignListRows.length > 0){
            return res.status(202).json({
                isSuccess : true,
                code: 100,
                message: "과제목록 수신에 성공했습니다.",
                result: {
                    courses : getAssignListRows
                }
            });
        } else {
            return res.status(202).json({
                isSuccess : true,
                code: 101,
                message: "과제목록이 비어있습니다."
            });
        }
    } catch(e) {
        return res.status(500).json({
            isSuccess : false,
            message: "서버에 문제가 발생하였습니다.",
        });
    }
};

/**
 * 강의리스트 API : 강의에 대한 과제 리스트 반환
 * @Body {*} studentId
 * @Header {*} Token
 * @returns courseList
 */
exports.courseList = async function(req, res) {
    const jwt_token=req.headers.access_token;
    const studentId = jwt.decode(jwt_token, jwtsecret).studentId;
    try {
        // 강의 리스트 반환
        const connection = await pool.getConnection((err, conn) => (conn));
        const getCourseListQuery = "SELECT * FROM COURSE WHERE COURSE_ID IN (SELECT COURSE_ID FROM COURSE_REGISTER WHERE ST_ID=?)";
        const getCourseListRows = await conn.query(getCourseListQuery, [studentId]);
        if (getCourseListRows.length > 0) {
            conn.release();
            return res.status(202).json({
                isSuccess : true,
                code : 100,
                message : "수업목록 수신에 성공했습니다.",
                result : {courseList : result}
            })
        } else {
            conn.release();
            return res.status(202).json({
                isSuccess : true,
                code: 100,
                message: "수강하는 과목이 없습니다."
            });
        }
    } catch(e) {
        conn.release();
        return res.status(500).json({
            isSuccess : false,
            message: "서버에 문제가 발생하였습니다.",
        });
    }
};
