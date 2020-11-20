module.exports = function(app){
    const user = require('../controllers/userController');
    
    //app.route("/join").post(user.signUp);
    app.post("/login", user.signIn);
    app.post("/user", user.signUp);
}

