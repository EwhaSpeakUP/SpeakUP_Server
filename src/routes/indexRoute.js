
module.exports = function(app){
    const index = require('../controllers/indexController');

    app.post('/index/hwList',index.hwList);
};