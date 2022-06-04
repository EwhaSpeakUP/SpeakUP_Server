const express = require("express");
const dotenv = require('dotenv');
const morgan = require('morgan');
const CookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = function() {
  dotenv.config();
  const app = express();
  
  app.set('port', process.env.PORT || 3000);
  
  app.use(morgan('dev'));
  app.use(express.json({limit: "5mb"})); // 5MB
  app.use(express.urlencoded({ limit:"5mb",extended: false }));
  app.use(CookieParser(process.env.COOKIE_SECRET));
  app.use(session({
    resave: false,
    saveUninitialized : false,
    secret: process.env.COOKIE_SECRET,
    cookie : {
      httpOnly : true,
      secure: false,
    }
  }));

  /* App (Android, iOS) */
  //require("../src/routes/assignRoute")(app);
  //require("../src/routes/indexRoute")(app);
  app.use(require("../src/routes/userRoute"));

  return app;
};