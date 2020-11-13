
module.exports = function(app){
    const index = require('../controllers/indexController');
    const auth = require("../../auth");


    app.get("/course", auth, index.courseList);
    app.get("/assignList/:courseID",auth, index.assignList);  


};