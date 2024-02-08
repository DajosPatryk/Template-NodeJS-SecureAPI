/**
 * Mocks
 */
const mockedTeamInput = {
    ownerEmail: "owner@jest.co",
    name: "JestTeam",
    maxMemberCount: 15
};
const mockedTeamOutput = {
    id: "mockedTeamId",
    name: "JestTeam",
    maxMemberCount: 15,
    ownerId: "mockedOwnerId",
    owner: {
        id: "mockedOwnerId",
        name: "TeamOwner",
        email: "owner@jest.co",
        hashedPassword: "hashedPassword",
        score: 10
    },
    memberships: [
        {
            user: {
                id: "mockedUserId",
                name: "MemberOne",
                email: "user1@jest.co",
                hashedPassword: "hashedPassword",
                score: 50
            }
        },
        {
            user: {
                id: "mockedUserId2",
                name: "MemberTwo",
                email: "user2@jest.co",
                hashedPassword: "hashedPassword",
                score: 30
            }
        }
    ]
};
const mockedFormattedTeamOutput = {
    name: expect.any(String),
    ownerName: expect.any(String),
    totalScore: expect.any(Number),
    memberNumber: expect.any(Number),
    availableMemberNumber: expect.any(Number),
    members: expect.any(Array)
};
const mockedTeamUpdateData = {
    name: "NewJestTeam",
    maxMemberCount: 20
}
const mockedFormattedUpdatedTeamOutput = {
    name: "NewJestTeam",
    ownerName: expect.any(String),
    totalScore: expect.any(Number),
    memberNumber: 2,
    availableMemberNumber: 20 - 2,
    members: expect.any(Array)
}

/**
 * Imports
 */
const {createTeam, updateTeam, deleteTeam, getTeam, getAllTeams, mapToTeamDTO} = require('../../../src/controllers/team/teamController.js');
const {prismaMock} = require('../../singleton.ts');

describe("createTeam function", () => {
    it("should throw an error if team name already exists", async () => {
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);

        const result = await createTeam(mockedTeamInput.ownerEmail, mockedTeamInput.name, mockedTeamInput.maxMemberCount);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team name already exists.");
    });

    it("should return a formatted team object on successful creation", async () => {
        prismaMock.team.findUnique.mockResolvedValueOnce(null);
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.create.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await createTeam(mockedTeamInput.ownerEmail, mockedTeamInput.name, mockedTeamInput.maxMemberCount);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(mockedFormattedTeamOutput);
    });
});

describe("updateTeam function", () => {
    it("should throw an error if owner does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(null);

        const result = await updateTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail, {name: "NewJestTeam", maxMemberCount: 20});

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Owner does not exist.");
    });

    it("should throw an error if team does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.findUnique.mockResolvedValueOnce(null);

        const result = await updateTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail, {name: "NewJestTeam", maxMemberCount: 20});

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team does not exist.");
    });

    it("should deny update if user is not owner", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.memberships[0].user); // Bad owner return
        prismaMock.team.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.team.update.mockResolvedValueOnce({ ...mockedTeamOutput, name: "NewJestTeam", maxMemberCount: 20 });
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await updateTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail, {name: "NewJestTeam", maxMemberCount: 20});

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Forbidden. Only team owner can update the team.");
    });

    it("should successfully update team name and maxMemberCount", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.team.update.mockResolvedValueOnce({ ...mockedTeamOutput, name: "NewJestTeam", maxMemberCount: 20 });
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await updateTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail, mockedTeamUpdateData);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toMatchObject(mockedFormattedUpdatedTeamOutput);
    });
});

describe("deleteTeam function", () => {
    it("should deny deletion if user is not owner", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.memberships[0].user); // Bad owner return
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.team.delete.mockResolvedValueOnce({ count: 1 });
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await deleteTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Forbidden. Only team owner can delete the team.");
    });

    it("should confirm deletion when team exists and user is owner", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.team.delete.mockResolvedValueOnce({ count: 1 });
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await deleteTeam(mockedTeamInput.name, mockedTeamInput.ownerEmail);

        expect(result.isSuccess()).toBe(true);
    });
});

describe("getTeam function", () => {
    it("should return an error if the team does not exist", async () => {
        prismaMock.team.findUnique.mockResolvedValueOnce(null);

        const result = await getTeam("bad");

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team does not exist.");
    });

    it("should return a formatted team object", async () => {
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const result = await getTeam(mockedTeamInput.name);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(mockedFormattedTeamOutput);
    });
});

describe("getAllTeams function", () => {
    it("should return an empty array if no teams exist", async () => {
        prismaMock.team.findMany.mockResolvedValueOnce([]);

        const result = await getAllTeams();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([]);
    });

    it("should return an array of formatted team objects if teams exist", async () => {
        prismaMock.team.findMany.mockResolvedValueOnce([mockedTeamOutput, mockedTeamOutput]);
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships).mockResolvedValueOnce(mockedTeamOutput.memberships);
        const mockedFormattedTeamOutputNoMembers = mockedFormattedTeamOutput;
        delete mockedFormattedTeamOutputNoMembers.members;

        const result = await getAllTeams();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(expect.arrayContaining([mockedFormattedTeamOutputNoMembers, mockedFormattedTeamOutputNoMembers]));
    });
});

describe("mapToTeamDTO function", () => {
    it("should format a team object correctly", async () => {
        prismaMock.teamMembership.findMany.mockResolvedValueOnce(mockedTeamOutput.memberships);

        const formattedTeam = await mapToTeamDTO(mockedTeamOutput, mockedTeamOutput.owner);

        expect(formattedTeam).toEqual(mockedFormattedTeamOutput);
    });
});
