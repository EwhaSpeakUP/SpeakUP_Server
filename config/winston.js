
/*  winston.js
    create date: 2020-09-25
    revise date: 2020-09-25
    programmer: Hyeji Kim(1771018)
*/
const winston = require('winston');
const env = process.env.NODE_ENV || 'development';
const logpath = '../log';
require('winston-daily-rotate-file')
/**
const dailyRotateLogFileTransport = new winston.transports.dailyRotateFile({
    level: 'debug',
    filename: `$(logpath)/%DATE%-smart-push.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});
 */


const logger = winston.createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.printf(
                    info => `${info.timestamp} ${info.level} ${info.message}`
                )
            )
        }), // print log on Console
        //dailyRotateLogFileTransport, // 매일 log 기록
        new winston.transports.File({level:"error", filename:'${logpath}/error.log'}) //error들은 따로 기록
    ]

});

//외부에서 사용할수있도록
module.exports = {
    logger: logger
};