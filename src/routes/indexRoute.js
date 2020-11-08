
module.exports = function(app){
    const index = require('../controllers/indexController');
    const auth = require("../../auth");


    app.get("/index/courseList", auth, index.courseList);
    app.get('/index/:courseId/assignList',auth, index.assignList);  


};