const { Result } = require("../../utils");
const prisma = require("../../../prisma");

/**
 * Retrieves and formats a user's details.
 * @param {string|null} email - User email.
 * @param {string|null} name - Username.
 * @returns {Promise<Result<{value: {rank: number, name: string, score: number, team: Array<string>}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - Result with formatted user object.
 *
 * @throws {Error} - Internal errors.
 */
async function getUser(email, name) {
    // Determines wether to use email or username
    const queryIsValid = Result.failIf(!email && !name, "Email or name must be provided.");
    if (queryIsValid.isError()) return Result.fail(queryIsValid);
    const searchValue = email ? {email} : {name};

    // Retrieves user
    const user = await prisma.user.findUnique({
        where: searchValue,
        include: {teamMemberships: {include: {team: true}}}
    });
    const userExists = Result.failIf(!user, "User does not exist.", 404);
    if (userExists.isError()) return Result.fail(userExists);

    return Result.ok(
        await mapToUserDTO(user, true)
    );
}

/**
 * Retrieves and formats details of all users.
 * @returns {Promise<Result<{value: Array<{rank: number, name: string, score: number, team: Array<string>}>, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - Array of formatted user objects.
 *
 * @throws {Error} - 500 on retrieval failure.
 */
async function getAllUsers() {
    // Retrieves all users
    const users = await prisma.user.findMany({
        include: {
            teamMemberships: {
                include: {
                    team: true
                }
            }
        },
        orderBy: {
            score: 'desc'
        }
    });

    return Result.ok(
        await Promise.all(users.map((user, index) => mapToUserDTO(user, true, index)))
    );
}

/**
 * Formats user data for presentation.
 * @param {Object} user - Database user object.
 * @param [includeTeams=false] - If formatted user object should include formatted teams.
 * @param {number} [index=null] - User rank starting from 0 being the highest.
 * @returns {Promise<{rank: number, name: string, score: number, team: Array<string>}>} - Formatted user object with rank, name, score, and team names.
 *
 * @throws {Error} - 500 if user ranking fails.
 */
async function mapToUserDTO(user, includeTeams = false, index = null) {
    let rank = index + 1;

    // Counts users with higher scores
    if(!index){
        const higherRankedUsers = await prisma.user.count({
            where: {
                score: {gt: user.score}
            }
        });
        rank = higherRankedUsers + 1;
    }

    let result = {
        rank: rank,
        name: user.name,
        score: user.score
    };

    // Attaches teams
    if (includeTeams) result.team = user.teamMemberships.map(membership => membership.team.name);

    return result;
}

module.exports = {
    getUser,
    getAllUsers,
    mapToUserDTO
}