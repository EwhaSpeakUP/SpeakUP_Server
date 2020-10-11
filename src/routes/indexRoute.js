
module.exports = function(app){
    const index = require('../controllers/indexController');

    app.get("/index/courseList/:stID",index.classList);
    app.get('/index/:courseId/assignList',index.assignList);  

};