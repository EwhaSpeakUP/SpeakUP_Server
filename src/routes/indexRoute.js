
module.exports = function(app){
    const index = require('../controllers/indexController');
    const auth = require("../../auth");


    app.get("/course", auth, index.courseList);
    app.get("/assignList/:courseId",auth, index.assignList);  


};