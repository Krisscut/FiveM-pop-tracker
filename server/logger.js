/**
 * Created by STE14179 on 10/07/2017.
 */
var winston = require('winston');
var constants = require('./constants');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(
            {
                json: false,
                timestamp: true,
                colorize: true
            }
        ),
        new winston.transports.File(
            {
                filename: __dirname + './../logs/debug.log',
                json: false,
                maxsize: 5000000,
                maxFiles: 5
            }
        )
    ],
    exceptionHandlers: [
        new (winston.transports.Console)(
            {
                json: false,
                timestamp: true,
                colorize: true
            }
        ),
        new winston.transports.File(
            {
                filename: __dirname + './../logs/exceptions.log',
                json: false,
                maxsize: 5000000,
                maxFiles: 5
            }
        )
    ],
    exitOnError: false
});

logger.transports.console.level = constants.LOG_LEVEL;
logger.transports.file.level = constants.LOG_LEVEL;

module.exports = logger;