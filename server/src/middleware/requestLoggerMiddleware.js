/**
 * Logs details of HTTP requests and responses.
 * It captures and logs the method, URL, status code, request, response, and duration of each request. Uses global Winston logger.
 * Sensitive data handling in ensured by not logging request or response bodies directly.
 *
 * @param {Object} req - The HTTP request object provided by Express.
 * @param {Object} res - The HTTP response object provided by Express.
 * @param {Function} next - The callback function to pass control to the next middleware function in the stack.
 */
const logRequests = (req, res, next) => {
    const start = Date.now();

    function logRequest() {
        const duration = Date.now() - start;
        const { method, url } = req;
        const { statusCode } = res;

        global.logger.info({
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
        });

        res.removeListener('finish', logRequest);
        res.removeListener('close', logRequest);
    }

    res.on('finish', logRequest);
    res.on('close', logRequest);

    next();
};

module.exports = { logRequests }