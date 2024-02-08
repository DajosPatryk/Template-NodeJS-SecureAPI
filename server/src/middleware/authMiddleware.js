const jwt = require('jsonwebtoken');
const errorFactory = require("../utils/errorFactory.js");

/**
 * Middleware function to authenticate user with JWT token.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Next middleware function.
 *
 * @throws {Error} - Throws an error with code 401 if no token or if verification fails.
 */
function authenticateToken(req, res, next) {
    // Retrieves token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        errorFactory(403, "Forbidden", 401, "Token missing or malformed.", null, req);
        return res.status(403).json({ message: "Forbidden.", code: 403 });
    }

    // Verifies token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            errorFactory(403, "Forbidden.", 403, "Bad token.", null, req);
            return res.status(403).json({ message: "Forbidden.", code: 403 });
        }

        req.user = user; // Adds payload to request
        next();
    });
}

module.exports = {
    authenticateToken
}