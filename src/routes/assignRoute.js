module.exports = function(app) {
    const assign = require("../controllers/assignController");
    
    //app.use('/assign/uploadAssign',assign.);
    app.post("/assign/:hwID/:stID", assign.uploadS3.single('file'),assign.uploadAssign); // 과제 음성 업로드 (학생)
    app.post("/assign/transmitFile",assign.transmitFile);
};