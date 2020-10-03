
module.exports = function(app){
    const index = require('../controllers/indexController');

    app.get('/index/:classID/hwList',index.hwList);
    app.get("/index/classList/:stdNUM",index.classList);
};