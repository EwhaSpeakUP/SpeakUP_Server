module.exports = function(app) {
    const assign = require("../controllers/assignController");
    
    app.use('/assign/uploadFile',assign);
};