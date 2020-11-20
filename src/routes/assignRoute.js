module.exports = function(app) {
    const assign = require("../controllers/assignController");
    const auth = require("../../auth");

    app.post("/assign/:assignID", auth, assign.uploadAssign); // 통역 음성 업로드 (학생)
    app.get("/assign/:assignID", assign.transmitFile); // 연사 음성 학생에게 전송
    

};
