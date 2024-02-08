const errorFactory = require("./errorFactory.js");

/**
 * Encapsulates operation outcomes with value for success or error object for failure.
 *
 * - `constructor(value, error)`: Initializes with a value (any success data) or an error (error object).
 *
 * - `static failIf(predicate, message)`: Returns failure result if predicate is true, otherwise a neutral success result.
 *
 * - `static ok(value)`: Returns successful result.
 *
 * - `static fail(result)`: Fails the result, returns presentation ready failure result.
 *
 * - `isSuccess()`: Checks if the result is successful (no error object).
 *
 * - `isError()`: Checks if there's an error object (result is a failure).
 *
 * - `static merge(results)`: Merges multiple `Result` objects, combining error objects or values accordingly.
 */
class Result {
    /**
     * Initializes a Result instance with a value and an error object.
     * @param {any} value - The value of the operation, if successful.
     * @param {Array<Error>|Error|null} error - The error message, if the operation failed.
     */
    constructor(value, error) {
        this.value = value;
        this.error = error ? [].concat(error) : null;
    }

    /**
     * Creates a failed Result with an error if a condition is true.
     * @param {boolean} predicate - Condition that triggers failure.
     * @param {string} [externalMessage="Bad request."] - Message associated with the error, safe to use as response.
     * @param {number} [externalCode=400] - HTTP status code, safe to use as response.
     * @param {string} [internalMessage=externalMessage] - Message associated with the error.
     * @param {number} [internalCode=externalCode] - HTTP status code.
     * @param {Error|null} [error=null] - An optional Error object from which additional details can be extracted.
     * @param {Object|null} [req=null] - An optional HTTP request object associated with the error.
     * @returns {Result} - A failure Result with the specified error, otherwise a success Result with no value.
     */
    static failIf(predicate, externalMessage = "Bad request.", externalCode = 400, internalMessage = externalMessage, internalCode = externalCode, error = null, req = null) {
        if (predicate) {
            return new Result(null, [errorFactory(externalMessage, externalCode, internalMessage, internalCode, error, req)]);
        }
        return new Result(null, null);
    }

    /**
     * Returns success Result with value.
     * @param {any} value - Value object.
     * @returns {Result} - Returns successful Result.
     */
    static ok(value = null){
        return new Result(value, null);
    }

    /**
     * Returns failure Result with errors mapped for presentation.
     * @param {Result<{value: any, error: Array<Error>}>} result - Result to fail.
     * @returns {Result} - Returns failure Result.
     */
    static fail(result){
        const errors = result.error.map(err => err.external ? err.external : { code: 500, message: err.message });
        return new Result(null, errors);
    }

    /**
     * Checks if the Result represents a successful operation.
     * @returns {boolean} - True if the Result is a success (no error), false otherwise.
     */
    isSuccess() {
        return !this.error || this.error.length === 0;
    }

    /**
     * Checks if the Result represents a failed operation.
     * @returns {boolean} - True if the Result has an error, false otherwise.
     */
    isError() {
        return !!this.error && this.error.length > 0;
    }

    /**
     * Merges an array of Result objects into a single Result, combining all values or errors.
     * @param {Array<Result>} results - Array of Result objects to merge.
     * @returns {Result} - A single Result containing either an array of all success values or an array of all errors.
     */
    static merge(results) {
        const errors = [];
        const values = results.filter(result => result.isSuccess()).map(result => result.value).filter(value => value !== null);

        results.forEach(result => {
            if (result.isError()) errors.push(...result.error);
        });

        return errors.length ? new Result(null, errors) : new Result(values.length <= 1 ? values[0] : values, null);
    }
}

module.exports = Result;