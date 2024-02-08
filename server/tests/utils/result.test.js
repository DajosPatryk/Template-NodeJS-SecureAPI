const {Result} = require('../../src/utils');

describe("Result class", () => {

    describe("constructor", () => {
        it("should create a successful result with a value", () => {
            const result = new Result("success", null);
            expect(result.value).toEqual("success");
            expect(result.error).toBeNull();
        });

        it("should create a failure result with an error", () => {
            const error = new Error("failure");
            const result = new Result(null, error);
            expect(result.value).toBeNull();
            expect(result.error).toContain(error);
        });
    });

    describe("failIf", () => {
        it("should return a failure result if predicate is true", () => {
            const result = Result.failIf(true, "Error");
            expect(result.isError()).toBe(true);
            expect(result.error[0].message).toEqual("Error");
        });

        it("should return a successful result if predicate is false", () => {
            const result = Result.failIf(false);
            expect(result.isSuccess()).toBe(true);
        });
    });

    describe("ok", () => {
        it("should return a successful result with a value", () => {
            const result = Result.ok("success");
            expect(result.isSuccess()).toBe(true);
            expect(result.value).toEqual("success");
        });
    });

    describe("fail", () => {
        it("should fail a result and return empty value", () => {
            const error = new Error("failure");
            const result = new Result("success", error);
            const failedResult = Result.fail(result);
            expect(failedResult.isError()).toBe(true);
            expect(failedResult.value).toEqual(null);
        });

        it("should fail a result and format error to external", () => {
            const initialFailure = Result.failIf(true, "External error", 500, "Internal error", 404);
            const failedResult = Result.fail(initialFailure);
            expect(failedResult.isError()).toBe(true);
            expect(failedResult.error).toEqual([initialFailure.error[0].external]);
        });
    });

    describe("isSuccess", () => {
        it("should return true for a success result", () => {
            const result = Result.ok("success");
            expect(result.isSuccess()).toBe(true);
        });

        it("should return false for a failure result", () => {
            const result = Result.failIf(true, "Error");
            expect(result.isSuccess()).toBe(false);
        });
    });

    describe("isError", () => {
        it("should return false for a success result", () => {
            const result = Result.ok("success");
            expect(result.isError()).toBe(false);
        });

        it("should return true for a failure result", () => {
            const result = Result.failIf(true, "Error");
            expect(result.isError()).toBe(true);
        });
    });

    describe("merge", () => {
        it("should merge one success results into object", () => {
            const results = [Result.ok("value1")];
            const merged = Result.merge(results);
            expect(merged.isSuccess()).toBe(true);
            expect(merged.value).toEqual("value1");
        });

        it("should merge multiple success results into one", () => {
            const results = [Result.ok("value1"), Result.ok("value2")];
            const merged = Result.merge(results);
            expect(merged.isSuccess()).toBe(true);
            expect(merged.value).toEqual(["value1", "value2"]);
        });

        it("should merge success and failure results into a failure", () => {
            const results = [Result.ok("value1"), Result.failIf(true, "Error")];
            const merged = Result.merge(results);
            expect(merged.isError()).toBe(true);
        });

        it("should merge multiple failure results into one with all errors combined", () => {
            const results = [Result.failIf(true, "Error1"), Result.failIf(true, "Error2")];
            const merged = Result.merge(results);
            expect(merged.isError()).toBe(true);
            expect(merged.error.length).toBe(2);
            expect(merged.error[0].message).toEqual("Error1");
            expect(merged.error[1].message).toEqual("Error2");
        });
    });

});