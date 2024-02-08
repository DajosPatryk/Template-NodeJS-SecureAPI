const path = require('path');
const fs = require('fs');
const winston = require('winston');
const { dateFormatter } = require("../src/utils");

/*
 * Logger setup.
 * Configures logging: Winston for structured file logging.
 * Log files are named with the current date in 'log/test'. Ensures log directory exists.
 */
const logDir = path.join(__dirname, '..', 'log/test');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const testLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, `${dateFormatter.getCurrentDateSimple()}test.log`),
            level: 'debug'
        })
    ]
});
global.logger = testLogger;