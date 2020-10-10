module.exports = function(app) {
    const assign = require("../controllers/assignController");
    
    //app.use('/assign/uploadAssign',assign.);
    app.post("/assign/:hwID/:stID", assign.uploadS3.single('file'),assign.uploadAssign); // 통역 음성 업로드 (학생)
    app.get("/assign/:assignID",assign.transmitFile); // 연사 음성 다운로드 (학생)
};