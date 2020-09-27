const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
var cors = require("cors");
//const bodyParser = require('body-parser');  // 5MB app.use(bodyParser.urlencoded({limit: 5000000, extended: true, parameterLimit:50000})); // limit: 5MB

module.exports = function() {
  const app = express();

  app.use(compression());


  app.use(express.urlencoded({ limit:"5mb",extended: true }));
  
  app.use(express.json({limit: "5mb"})); // 5MB

  app.use(methodOverride());

  app.use(cors());
  // app.use(express.static(process.cwd() + '/public'));

  /* App (Android, iOS) */
  //require("../src/app/routes/indexRoute")(app);
  //require("../src/app/routes/userRoute")(app);
  //require("../src/app/routes/musicRoute")(app);
  require("../src/routes/assignRoute")(app);
  
  
  /* Web */
  // require('../src/web/routes/indexRoute')(app);

  /* Web Admin*/
  // require('../src/web-admin/routes/indexRoute')(app);
  return app;
};