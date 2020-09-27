module.exports = function(app){
    const user = require('../controllers/userController');
    
    app.route("/join").post(user.signUp);
    app.route("/login").post(user.singIn);

}

