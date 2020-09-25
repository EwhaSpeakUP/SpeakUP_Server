/*  winston.js
    create date: 2020-09-25
    revise date: 2020-09-25
    programmer: Hyeji Kim(1771018)
*/

const winston = require('winston');

const logger = winston.createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.json()
    ),
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.printf(
                    info => `${info.timestamp} ${info.level} ${info.message}`
                )
            )
        }), // print log on Console
        new transports.File({filename: "../logs/combined.log"}), //log 기록
        new transports.File({level:"error", filename:'../logs/error.log'}) //error들은 따로 기록
    ]

});

module.exports = {
    logger: logger
};