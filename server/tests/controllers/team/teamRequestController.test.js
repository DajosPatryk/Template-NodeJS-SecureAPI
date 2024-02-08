/**
 * Mocks
 */
const mockedJoinerInput = {
    name: "MemberThree",
    email: "user3@jest.co",
    message: "Please let me join",
    teamName: "JestTeam"
};
const mockedJoinerOutput = {
    id: "mockedUserId3",
    name: "MemberThree",
    email: "user3@jest.co",
    hashedPassword: "hashedPassword",
    score: 10
}
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
const mockedTeamRequestOutput = {
    id: "mockedRequestId",
    teamId: "mockedTeamId",
    userId: "mockedUserId",
    user: {
        id: "mockedUserId3",
        name: "MemberThree",
        email: "user3@jest.co",
        hashedPassword: "hashedPassword",
        score: 10
    },
    message: "Please let me join"
};
const mockedFormattedTeamRequest = {
    name: expect.any(String),
    message: expect.any(String)
}

/**
 * Imports
 */
const {
    createTeamRequest,
    acceptTeamRequest,
    deleteTeamRequest,
    getAllTeamRequests,
    mapToTeamRequestDTO
} = require('../../../src/controllers/team/teamRequestController.js');
const {prismaMock} = require('../../singleton.ts');

describe("createTeamRequest function", () => {
    it("should throw an error if user or team name is not provided", async () => {
        const result = await createTeamRequest(null, null);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("User and team name must be provided.");
    });

    it("should throw an error if user does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(null);

        const result = await createTeamRequest(mockedJoinerInput.email, mockedTeamOutput.name);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("User does not exist.");
    });

    it("should throw an error if team request is not unique", async () => {
        prismaMock.teamRequest.findUnique.mockResolvedValueOnce(mockedTeamRequestOutput);
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedJoinerOutput);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.create.mockResolvedValueOnce(mockedTeamRequestOutput);

        const result = await createTeamRequest(mockedJoinerInput.email, mockedJoinerInput.name, "Please let me join");

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team request already exists.");
    });

    it("should create a team request successfully", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedJoinerOutput);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.create.mockResolvedValueOnce(mockedTeamRequestOutput);

        const result = await createTeamRequest(mockedJoinerInput.email, mockedJoinerInput.name, "Please let me join");

        expect(result.isSuccess()).toBe(true);
    });
});

describe("acceptTeamRequest function", () => {
    it("should throw an error if parameters are missing", async () => {
        const result = await acceptTeamRequest(null, null, null);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Owner, user and team name must be provided.");
    });

    it("should throw an error if the team request does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.findFirst.mockResolvedValueOnce(null);

        const result = await acceptTeamRequest(mockedTeamOutput.owner.email, mockedTeamOutput.name, mockedJoinerInput.name);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team request does not exist.");
    });

    it("should accept a team request successfully", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner).mockResolvedValueOnce(mockedJoinerOutput);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.findFirst.mockResolvedValueOnce(mockedTeamRequestOutput);
        prismaMock.teamRequest.deleteMany.mockResolvedValueOnce({count: 1});
        prismaMock.teamMembership.create.mockResolvedValueOnce({});

        const result = await acceptTeamRequest(mockedTeamOutput.owner.email, mockedTeamOutput.name, mockedJoinerInput.name);
        console.log(result)
        expect(result.isSuccess()).toBe(true);
    });
});

describe("deleteTeamRequest function", () => {
    it("should throw an error if parameters are missing", async () => {
        const result = await deleteTeamRequest(null, null, null);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Owner, user and team name must be provided.");
    });

    it("should delete a team request successfully", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner).mockResolvedValueOnce(mockedJoinerOutput);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.deleteMany.mockResolvedValueOnce({count: 1});

        const result = await deleteTeamRequest(mockedTeamOutput.owner.email, mockedTeamOutput.name, mockedJoinerInput.name);

        expect(result.isSuccess()).toBe(true);
    });
});

describe("getAllTeamRequests function", () => {
    it("should throw an error if team does not exist", async () => {
        prismaMock.team.findUnique.mockResolvedValueOnce(null);

        const result = await getAllTeamRequests(mockedTeamOutput.owner.email, "bad");

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Team does not exist.");
    });

    it("should return an array of team requests", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedTeamOutput.owner);
        prismaMock.team.findUnique.mockResolvedValueOnce(mockedTeamOutput);
        prismaMock.teamRequest.findMany.mockResolvedValueOnce([mockedTeamRequestOutput,mockedTeamRequestOutput]);

        const result = await getAllTeamRequests(mockedTeamOutput.owner.email, mockedTeamOutput.name);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([mockedFormattedTeamRequest,mockedFormattedTeamRequest]);
    });
});

describe("mapToTeamRequestDTO function", () => {
    it("should format a team request object correctly", async () => {
        const formattedTeamRequest = await mapToTeamRequestDTO(mockedTeamRequestOutput);

        expect(formattedTeamRequest).toEqual(mockedFormattedTeamRequest);
    });
});