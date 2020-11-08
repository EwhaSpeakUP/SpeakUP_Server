module.exports = function(app){
    const user = require('../controllers/userController');
    
<<<<<<< HEAD
    //app.route("/join").post(user.signUp);
    app.post("/login",user.signIn);
    app.get("/test",user.test);
=======
    app.post("/login", user.signIn);
    app.post("/user", user.signUp);

>>>>>>> 311f6831264c4e9fd4cbc212a2e52571c453f790
}

