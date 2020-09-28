module.exports = function(app) {
    const assign = require("../controllers/assignController");
    
    //app.use('/assign/uploadFile',assign.);
    app.post("/assign/uploadFile", assign.uploadS3.single('file'),assign.uploadFile);
};