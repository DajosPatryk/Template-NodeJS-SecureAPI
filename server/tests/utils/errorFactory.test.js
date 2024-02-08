/**
 * Mocks
 */
const code = 400;
const message = "Internal error";
const external = {
    code: 500,
    message: "External error"
}

/**
 * Imports
 */
const errorFactory = require('../../src/utils/errorFactory.js');

/**
 * Testing errorFactory function
 */
describe("errorFactory function", () => {
    it("should return a new error with 2 params", async () => {
        const error = errorFactory(external.message, external.code);

        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code', external.code);
        expect(error).toHaveProperty('message', external.message);
        expect(error).toHaveProperty('external', external)
        expect(error).toHaveProperty('stack');
    });

    it("should return a new error with 3 params", async () => {
        const error = errorFactory(external.message, external.code, message);

        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code', external.code);
        expect(error).toHaveProperty('message', message);
        expect(error).toHaveProperty('external', external);
        expect(error).toHaveProperty('stack');
    });

    it("should return a new error with 4 params", async () => {
        const error = errorFactory(external.message, external.code, message, code);

        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code', code);
        expect(error).toHaveProperty('message', message);
        expect(error).toHaveProperty('external', external);
        expect(error).toHaveProperty('stack');
    });
});