module.exports = function(app){
    const user = require('../controllers/userController');
    

    app.post("/login", user.signIn);
    app.post("/user", user.signUp);
}

