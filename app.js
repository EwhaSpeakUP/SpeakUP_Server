const express = require("./config/express");
const { logger } = require("./config/winston");
const db = require('./models');
const app = express();

db.sequelize.sync()
    .then(() => {
        console.log('MySQL 데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    })
    



app.listen(app.get('port'), ()=> {
    logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${app.get('port')}`);
})
