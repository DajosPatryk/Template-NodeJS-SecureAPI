const authMiddleware = require("./authMiddleware.js");
const requestLoggerMiddleware = require("./requestLoggerMiddleware.js");
const errorHandlerAfterRoute = require("./errorHandlerAfterRoute.js");
module.exports = {
    authMiddleware,
    requestLoggerMiddleware,
    errorHandlerAfterRoute
}