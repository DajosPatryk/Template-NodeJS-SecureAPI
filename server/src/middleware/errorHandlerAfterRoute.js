const errorFactory = require("../utils/errorFactory.js");

/**
 * Middleware function to handle internal errors.
 * @param {Error} err - HTTP internal error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware function.
 */
function handleErrorAfterRoute(err, req, res, next) {
    errorFactory(`Internal server error.`, 500, `Internal server error: ${err.message}`, 500, err, req);
    res.status(500).json({message: "Internal server error.", code: 500});
}

module.exports = {
    handleErrorAfterRoute
}