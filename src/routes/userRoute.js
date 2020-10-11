module.exports = function(app){
    const user = require('../controllers/userController');
    
    app.post('/user', user.signUp);
    //app.route("/login").post(user.singIn);
    //app.get("/test",user.test);
}

