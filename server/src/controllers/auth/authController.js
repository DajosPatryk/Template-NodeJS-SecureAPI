const { Result } = require("../../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../../prisma");

/**
 * Registers a new user and generates a JWT.
 * @param {string} email - Unique user email.
 * @param {string} name - Unique username.
 * @param {string} password - User password.
 * @returns {Promise<Result<{value: {token: string}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - JWT for user.
 *
 * @throws {Error} - Internal errors.
 */
async function register(email, name, password) {
    // Validates data
    const [emailExists, nameExists] = await Promise.all([
        prisma.user.findUnique({ where: { email: email } }),
        prisma.user.findUnique({ where: { name: name } })
    ]);
    const emailIsUnique = Result.failIf(!!emailExists, "Email already exists.", 409);
    const nameIsUnique = Result.failIf(!!nameExists, "Name already exists.", 409);
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const emailIsValid = Result.failIf(!emailFormat.test(email), "Invalid email format.");
    const nameIsValid = Result.failIf(name.length < 4, "Name must be at least 4 characters long.");
    const passwordIsValid = Result.failIf(password.length < 8, "Password must be at least 8 characters long.");
    const dataValidation = Result.merge([emailIsUnique, nameIsUnique, emailIsValid, nameIsValid, passwordIsValid]);
    if (dataValidation.isError()) return Result.fail(dataValidation);

    // Hashes password
    const saltRounds = 10; // Salt rounds for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Creates user
    const score = Math.floor(Math.random() * 100) + 1;
    const user = await prisma.user.create({
        data: {
            email: email,
            hashedPassword: hashedPassword,
            name: name,
            score: score
        },
    });
    const userExists = Result.failIf(!user, "Failed registering user.", 409);
    if (userExists.isError()) return Result.fail(userExists);

    // Generates JWT token
    const token = jwt.sign(
        {
            email: user.email,
            name: user.name,
        },
        process.env.JWT_SECRET,
        {expiresIn: '36h'}
    );

    return Result.ok({
        token: token
    });
}

/**
 * Authenticates a user and generates a JWT.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<Result<{value: {token: string}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - JWT for user.
 *
 * @throws {Error} - Internal errors.
 */
async function signin(email, password) {
    // Finds user by email
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    const userIsValid = Result.failIf(!user, "Wrong combination of email and password, or user does not exist.", 401, "User does not exist.", 404);
    if (userIsValid.isError()) return Result.fail(userIsValid);

    // Verifies password
    const passwordIsValid = await bcrypt.compare(password, user.hashedPassword);
    const passwordIsValidResult = Result.failIf(!passwordIsValid, "Wrong combination of email and password, or user does not exist.", 401, "Bad password.");
    if (passwordIsValidResult.isError()) return Result.fail(passwordIsValidResult);

    // Generates JWT token
    const token = jwt.sign(
        {
            email: user.email,
            name: user.name,
        },
        process.env.JWT_SECRET,
        {expiresIn: '36h'}
    );

    return Result.ok({
        token: token
    });
}

module.exports = {
    register,
    signin
}