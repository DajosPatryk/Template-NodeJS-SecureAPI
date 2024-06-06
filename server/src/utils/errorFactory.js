/**
 * Constructs a new Error object with an additional 'code' property and logs the error details.
 * Standardizes error handling, more precise errors are logged for auditing and debugging.
 * Logs HTTP request object if provided for security analysis.
 *
 * @param {string} externalMessage - Message associated with the error, safe to use as response.
 * @param {number} externalCode - HTTP status code, safe to use as response.
 * @param {string} [internalMessage=externalMessage] - Message associated with the error.
 * @param {number} [internalCode=externalCode] - HTTP status code.
 * @param {Error|null} [error=null] - An optional Error object from which additional details can be extracted.
 * @param {Object|null} [req=null] - An optional HTTP request object associated with the error.
 * @returns {Error} A new Error object with the provided message and a 'code' property.
 */
function errorFactory(externalMessage, externalCode, internalMessage = externalMessage, internalCode = externalCode,  error = null, req = null) {
    const newError = new Error(internalMessage);
    newError.code = internalCode;
    newError.external = {
        code: externalCode,
        message: externalMessage
    };
    let stack = newError.stack; // Default to the new error's stack
    let errorDetails = {};

    // Parsing error object
    try {
        ({stack = stack, ...errorDetails} = error);
    } catch (error) {
    }

    // Logging error internally
    global.logger.error({
        message: internalMessage,
        code: internalMessage,
        external: {
            code: externalCode,
            message: externalMessage
        },
        function: 'errorFactory',
        errorDetails: errorDetails || "N/A",
        requestDetails: req || "N/A",
        stack: stack || newError.stack || "N/A"
    });

    if(process.env.NODE_ENV === "development") console.error(error ? error : newError);
    return newError;
}

module.exports = errorFactory
