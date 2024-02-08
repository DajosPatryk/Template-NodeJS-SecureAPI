const {Result} = require("../../utils");
const {mapToUserDTO} = require("../user/userController");
const prisma = require("../../../prisma");



/**
 * Creates a team request.
 * @param {string} email - User email requesting to join.
 * @param {string} teamName - Name of the team to join.
 * @param {string} message - Message with the request.
 * @returns {Promise<Result<{value: null, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The result of the team request creation.
 *
 * @throws {Error} - Internal errors.
 */
async function createTeamRequest(email, teamName, message = "") {
    // Validates data
    const paramsIsValid = Result.failIf(!email || !teamName, "User and team name must be provided.");
    if (paramsIsValid.isError()) return Result.fail(paramsIsValid);

    // Retrieves user and team
    const [user, team] = await Promise.all([
        prisma.user.findUnique({where: {email: email}}),
        prisma.team.findUnique({where: {name: teamName}})
    ]);

    // Validates existence
    const userExists = Result.failIf(!user, "User does not exist.", 404);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const existenceValidation = Result.merge([userExists, teamExists]);
    if (existenceValidation.isError()) return Result.fail(existenceValidation);

    // Creates team request
    const teamRequest = await prisma.teamRequest.create({
        data: {
            teamId: team.id,
            userId: user.id,
            message: message
        }
    });
    const requestCreated = Result.failIf(!teamRequest, "Failed to create team request.", 500);
    if (requestCreated.isError()) return Result.fail(requestCreated);

    return Result.ok();
}

/**
 * Accepts a team request by adding the user to the team's memberships.
 * @param {string} ownerEmail - Owner email.
 * @param {string} teamName - Team name.
 * @param {string} name - Name of the user who requested.
 * @returns {Promise<Result<{value: null, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The result of accepting the team request.
 *
 * @throws {Error} - Internal errors.
 */
async function acceptTeamRequest(ownerEmail, teamName, name) {
    // Validates data
    const paramsIsValid = Result.failIf(!ownerEmail || !teamName || !name, "Owner, user and team name must be provided.");
    if (paramsIsValid.isError()) return Result.fail(paramsIsValid);

    // Retrieves owner, user and team
    const [owner, team, user] = await Promise.all([
        prisma.user.findUnique({where: {email: ownerEmail}}),
        prisma.team.findUnique({where: {name: teamName}}),
        prisma.user.findUnique({where: {name: name}})
    ]);

    // Validates existence and ownership
    const userExists = Result.failIf(!user, "Team request does not exist.", 404);
    const ownerExists = Result.failIf(!owner, "Owner does not exist.", 404);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const validation = Result.merge([userExists, ownerExists, teamExists]);
    if (validation.isError()) return Result.fail(validation);
    const ownerIsTeamOwner = Result.failIf(team.ownerId !== owner.id, "Forbidden. Only team owner can accept requests.", 403);
    if (ownerIsTeamOwner.isError()) return Result.fail(ownerIsTeamOwner);

    // Accepts the first pending request (if any)
    const request = await prisma.teamRequest.findFirst({ where: { teamId: team.id, userId: user.id } });
    if (!request) return Result.fail("Team request does not exist.", 404);

    // Deletes the accepted request
    const result = await prisma.teamRequest.deleteMany({ where: { id: request.id } });
    const resultIsValid = Result.failIf(result.count < 1, "Team request not found.", 404);
    if(resultIsValid.isError()) return Result.fail(resultIsValid);

    // Adds user to team memberships
    await prisma.teamMembership.create({
        data: {
            teamId: team.id,
            userId: request.userId
        }
    });

    return Result.ok();
}

/**
 * Deletes a team request.
 * @param {string} ownerEmail - Owner email.
 * @param {string} teamName - Team name.
 * @param {string} name - Name of the user who requested.
 * @returns {Promise<Result<{value: null, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The result of the team request deletion.
 *
 * @throws {Error} - Internal errors.
 */
async function deleteTeamRequest(ownerEmail, teamName, name) {
    // Validates data
    const paramsIsValid = Result.failIf(!ownerEmail || !teamName || !name, "Owner, user and team name must be provided.");
    if (paramsIsValid.isError()) return Result.fail(paramsIsValid);

    // Retrieves owner, user and team
    const [owner, team, user] = await Promise.all([
        prisma.user.findUnique({where: {email: ownerEmail}}),
        prisma.team.findUnique({where: {name: teamName}}),
        prisma.user.findUnique({where: {name: name}})
    ]);

    // Validates existence and ownership
    const userExists = Result.failIf(!user, "User does not exist.", 404);
    const ownerExists = Result.failIf(!owner, "Owner does not exist.", 404);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const validation = Result.merge([userExists, ownerExists, teamExists]);
    if (validation.isError()) return Result.fail(validation);
    const ownerIsTeamOwner = Result.failIf(team.ownerId !== owner.id, "Forbidden. Only team owner can delete requests.", 403);
    if (ownerIsTeamOwner.isError()) return Result.fail(ownerIsTeamOwner);

    // Deletes team request
    const result = await prisma.teamRequest.deleteMany({ where: { teamId: team.id, userId: user.id } });
    const resultIsValid = Result.failIf(result.count < 1, "Team request not found.", 404);
    if(resultIsValid.isError()) return Result.fail(resultIsValid);

    return Result.ok();
}

/**
 * Retrieves all team specific join requests.
 * @returns {Promise<Result<{value: Array<{name: string, message: string}>, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - Array of all team request objects for specific team.
 *
 * @throws {Error} - Internal errors.
 */
async function getAllTeamRequests(ownerEmail, teamName) {
    // Retrieves owner and team
    const [owner, team] = await Promise.all([
        prisma.user.findUnique({where: {email: ownerEmail}}),
        prisma.team.findUnique({where: {name: teamName}})
    ]);

    // Validates existence and ownership
    const ownerIsTeamOwner = Result.failIf(team.ownerId !== owner.id, "Forbidden. Only team owner can fetch join requests.", 403);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const validation = Result.merge([teamExists, ownerIsTeamOwner]);
    if (validation.isError()) return Result.fail(validation);

    // Retrieves join requests
    const teamRequests = await prisma.teamRequest.findMany({
        where: { teamId: team.id },
        include: {
            user: true
        }
    });

    return Result.ok(
        teamRequests.map(req => mapToTeamRequestDTO(req))
    );
}

/**
 * Formats team requests for presentation.
 * @param {Object} teamRequest - Database team request object.
 * @returns {Promise<{name: string,  message: string} - Formatted team request object with name and message.
 *
 * @throws {Error} - Internal Errors.
 */
function mapToTeamRequestDTO(teamRequest) {
    return {
        name: teamRequest.user.name,
        message: teamRequest.message
    };
}

module.exports = {
    getAllTeamRequests,
    createTeamRequest,
    acceptTeamRequest,
    deleteTeamRequest,
    mapToTeamRequestDTO
}