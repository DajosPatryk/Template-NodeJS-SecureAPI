const {Result} = require("../../utils");
const {mapToUserDTO} = require("../user/userController");
const prisma = require("../../../prisma");

/**
 * Creates a team and assigns the owner.
 * @param {string} ownerEmail - Future owner email.
 * @param {string} name - Team name.
 * @param {number} maxMemberCount - Max members.
 * @returns {Promise<Result<{value: {name: string, ownerName: string, totalScore: number, memberNumber: number, availableMemberNumber: number, members: Array<Object>}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The created team object.
 *
 * @throws {Error} - Internal errors.
 */
async function createTeam(ownerEmail, name, maxMemberCount) {
    // Validates data
    const nameExists = await prisma.team.findUnique({where: {name: name}});
    const nameIsUnique = Result.failIf(!!nameExists, "Team name already exists.", 409);
    const paramsIsValid = Result.failIf(!ownerEmail || !name || !maxMemberCount, "Team name, owner, and max member count must be provided.");
    const nameIsValid = Result.failIf(name.length < 4, "Name must be at least 4 characters long.");
    const maxMemberCountIsValid = Result.failIf(maxMemberCount <= 10, "Max member count must be greater than 10.");
    const dataValidation = Result.merge([nameIsUnique, paramsIsValid, nameIsValid, maxMemberCountIsValid]);
    if (dataValidation.isError()) return Result.fail(dataValidation);

    // Retrieves owner
    const owner = await prisma.user.findUnique({where: {email: ownerEmail}});
    const ownerExists = Result.failIf(!owner, "Failed to create team.", 500, "User does not exist.", 404);
    if (ownerExists.isError()) return Result.fail(ownerExists);

    // Creates team
    const team = await prisma.team.create({
        data: {
            name,
            maxMemberCount,
            ownerId: owner.id,
            memberships: {
                create: [{
                    userId: owner.id
                }]
            }
        }
    });
    const teamExists = Result.failIf(!team, "Failed to create team.", 500);
    if (teamExists.isError()) return Result.fail(teamExists);

    return Result.ok(
        await mapToTeamDTO(team, owner, true)
    );
}

/**
 * Updates team information by team name and owner email.
 * @param {string} teamName - Team name.
 * @param {string} ownerEmail - Owner email.
 * @param {Object<name: string, maxMemberCount: number>} updateData - Update parameters.
 * @returns {Promise<Result<{value: {name: string, ownerName: string, totalScore: number, memberNumber: number, availableMemberNumber: number, members: Array<Object>}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The updated team.
 *
 * @throws {Error} - Internal errors.
 */
async function updateTeam(teamName, ownerEmail, updateData) {
    // Validates data
    const {name = null, maxMemberCount = null} = updateData;
    const nameExists = await prisma.team.findUnique({where: {name: name}});
    const nameIsUnique = Result.failIf(!!nameExists, "Team name already exists.", 409);
    const params1IsValid = Result.failIf(!teamName || !ownerEmail, "Team name and owner must be provided.");
    const params21IsValid = Result.failIf(!name && !maxMemberCount, "Team name or max member count must be provided.");
    const nameIsValid = Result.failIf(name.length < 4, "Name must be at least 4 characters long.");
    const maxMemberCountIsValid = Result.failIf(maxMemberCount <= 10, "Max member count must be greater than 10.");
    const dataValidation = Result.merge([nameIsUnique, params1IsValid, params21IsValid, nameIsValid, maxMemberCountIsValid]);
    if (dataValidation.isError()) return Result.fail(dataValidation);


    // Retrieves owner and team
    const [owner, team] = await Promise.all([
        prisma.user.findUnique({where: {email: ownerEmail}}),
        prisma.team.findUnique({where: {name: teamName}})
    ]);

    // Validates existence and ownership
    const ownerExists = Result.failIf(!owner, "Owner does not exist.", 404);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const validation = Result.merge([ownerExists, teamExists]);
    if (validation.isError()) return Result.fail(validation);
    const ownerIsTeamOwner = Result.failIf(team.ownerId !== owner.id, "Forbidden. Only team owner can update the team.", 403);
    if (ownerIsTeamOwner.isError()) return Result.fail(ownerIsTeamOwner);

    // Updates team
    const updatedTeam = await prisma.team.update({
        where: {id: team.id},
        data: {name, maxMemberCount}
    });
    const updatedTeamExists = Result.failIf(!updatedTeam, "Failed to update team.", 500);
    if (updatedTeamExists.isError()) return Result.fail(updatedTeamExists);
    if (!updatedTeam) throw errorFactory(500, "Failed to update team.");

    return Result.ok(
        await mapToTeamDTO(updatedTeam, owner, true)
    );
}

/**
 * Deletes a team by its team name and owner email.
 * @param {string} teamName - Team name.
 * @param {string} ownerEmail - Owner email.
 * @returns {Promise<Result<{value: null, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - Confirms team deletion.
 *
 * @throws {Error} - Internal errors.
 */
async function deleteTeam(teamName, ownerEmail) {
    // Validates data
    const paramsIsValid = Result.failIf(!teamName || !ownerEmail, "Team name and owner must be provided.");
    if (paramsIsValid.isError()) return Result.fail(paramsIsValid);

    // Retrieves owner and team
    const [owner, team] = await Promise.all([
        prisma.user.findUnique({where: {email: ownerEmail}}),
        prisma.team.findUnique({where: {name: teamName}})
    ]);

    // Validates existence and ownership
    const ownerExists = Result.failIf(!owner, "Owner does not exist.", 404);
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    const validation = Result.merge([ownerExists, teamExists]);
    if (validation.isError()) return Result.fail(validation);
    const ownerIsTeamOwner = Result.failIf(team.ownerId !== owner.id, "Forbidden. Only team owner can delete the team.", 403);
    if (ownerIsTeamOwner.isError()) return Result.fail(ownerIsTeamOwner);

    // Deletes team memberships and team
    const teamMemberships = await prisma.teamMembership.findMany({
        where: {teamId: team.id}
    });
    await prisma.teamMembership.deleteMany({
        where: {
            id: {
                in: teamMemberships.map(membership => membership.id)
            }
        }
    });
    await prisma.team.delete({where: {id: team.id}});

    return Result.ok();
}

/**
 * Retrieves a team by its name.
 * @param {string} name - Team name.
 * @returns {Promise<Result<{value: {name: string, ownerName: string, totalScore: number, memberNumber: number, availableMemberNumber: number, members: Array<Object>}, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - The requested team object with its details.
 *
 * @throws {Error} - Internal errors.
 */
async function getTeam(name) {
    // Validates data
    const nameIsValid = Result.failIf(!name, "Team name must be provided.");
    if (nameIsValid.isError()) return Result.fail(nameIsValid);

    // Retrieves team
    const team = await prisma.team.findUnique({
        where: {name},
        include: {
            owner: true,
            memberships: {
                include: {
                    user: true
                }
            }
        }
    });
    const teamExists = Result.failIf(!team, "Team does not exist.", 404);
    if (teamExists.isError()) return Result.fail(teamExists);

    return Result.ok(
        await mapToTeamDTO(team, team.owner, true)
    );
}

/**
 * Retrieves all teams.
 * @returns {Promise<Result<{value: Array<{name: string, ownerName: string, totalScore: number, memberNumber: number, availableMemberNumber: number}>, error: null}>>|Promise<Result<{value: null, error: Array<Error>}>>} - Array of all team objects.
 *
 * @throws {Error} - Internal errors.
 */
async function getAllTeams() {
    const teams = await prisma.team.findMany({
        include: {
            owner: true,
            memberships: {
                include: {
                    user: true
                }
            }
        }
    });

    return Result.ok(
        await Promise.all(teams.map(async (team) => await mapToTeamDTO(team, team.owner)))
    );
}

/**
 * Formats team data for presentation.
 * @param {Object} team - Database team object.
 * @param {Object} owner - Database user object, team owner.
 * @param {Boolean} [includeMembers=false] - If formatted team object should include formatted team members.
 * @returns {Promise<{name: string, ownerName: string,  totalScore: number, memberNumber: number, availableMemberNumber: number, team: Array<Object>|undefined}>} - Formatted team object with rank, name, score, and team names.
 *
 * @throws {Error} - Internal Errors.
 */
async function mapToTeamDTO(team, owner, includeMembers = false) {
    // Retrieves team members
    const members = await prisma.teamMembership.findMany({
        where: {teamId: team.id},
        include: {user: true}
    });

    // Defines totalScore & team members
    const totalScore = members.reduce((acc, membership) => acc + membership.user.score, 0);

    let result = {
        name: team.name,
        ownerName: owner.name,
        totalScore: totalScore || 0,
        memberNumber: members ? members.length : 0,
        availableMemberNumber: team.maxMemberCount - (members ? members.length : 0)
    };

    // Attaches team members
    if (includeMembers) result.members = await Promise.all(members.map(async member => await mapToUserDTO(member.user)));

    return result;
}

module.exports = {
    getTeam,
    getAllTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    mapToTeamDTO
}