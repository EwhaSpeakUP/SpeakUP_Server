
module.exports = function(app){
    const index = require('../controllers/indexController');
-
    app.get('/index/:courseId/assignList',index.assignList);
    app.get("/index/classList/:stdNUM",index.classList);
};