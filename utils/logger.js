const path = require('path');
const fs = require('fs');
const winston = require('winston');

const FOLDER = `${__dirname}/${path.join("..", "logs")}`;

// Create folder if not exists
if(!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER);

/*
    https://github.com/winstonjs/winston/blob/master/docs/transports.md
  
    Log level:
    error: 0
    warn: 1 
    info: 2 
    verbose: 3
    debug: 4
    silly: 5 
*/

const alignedWithColorsAndTime = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => {
        const {
            timestamp, level, message, ...args
        } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }),
);

module.exports = winston.createLogger({
    level: 'info',
    format: alignedWithColorsAndTime,
    transports: [
        new winston.transports.File({
            filename: `${FOLDER}/error.log`,
            level: 'error',
        }),
        new winston.transports.File({
            filename: `${FOLDER}/combined.log`,
            maxsize: 5120000,
            maxFiles: 5,
        }),
        new winston.transports.Console({
            level: process.env.NODE_ENV == 'test' ? 'error' : 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            prettyPrint: object => {
                return JSON.stringify(object);
            }
        })
    ]
});
