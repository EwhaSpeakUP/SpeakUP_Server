
module.exports = function(app){
    const model = require('../controllers/modelController');
    app.get("/model",model.model);

};