/**
 * Mocks
 */
const mockedUserInput = {
    email: "test@jest.co",
    name: "TestJoe"
}
const mockedUserOutput = {
    id: "mockedId",
    email: "test@jest.co",
    hashedPassword: "hashedPassword",
    name: "TestJoe",
    score: 10,
    teamMemberships: [
        {
            team: {
                id: "mockedId1",
                name: "mockedName1",
                maxMemberCount: 11,
                ownerId: "mockedId"
            }
        },
        {
            team: {
                id: "mockedId2",
                name: "mockedName2",
                maxMemberCount: 12,
                ownerId: "mockedId1"
            }
        },
    ],
    ownedTeams: [
        {
            id: "mockedId1",
            name: "mockedName1",
            maxMemberCount: 11,
            ownerId: "mockedId"
        }
    ]
};
const mockedFormattedUserOutput = {
    rank: expect.any(Number),
    name: expect.any(String),
    score: expect.any(Number),
    team: expect.any(Array)
};

/**
 * Imports
 */
const {getUser, getAllUsers, mapToUserDTO} = require('../../../src/controllers/user/userController');
const {prismaMock} = require('../../singleton.ts');

describe("getUser function", () => {
    it("should throw an error if no email or name is provided", async () => {
        const result = await getUser(null, null);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Email or name must be provided.");
    });

    it("should throw an error if user does not exist", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(null);

        const result = await getUser("bad", null);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("User does not exist.");
    });

    it("should return a formatted user object", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedUserOutput);
        prismaMock.user.count.mockResolvedValueOnce(1);

        const result = await getUser(mockedUserInput.email, null);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(mockedFormattedUserOutput);
    });
});

describe("getAllUsers function", () => {
    it("should throw an error if fails to fetch users", async () => {
        prismaMock.user.findMany.mockRejectedValueOnce(new Error("Failed to fetch user."));

        await expect(getAllUsers()).rejects.toThrow("Failed to fetch user.");
    });

    it("should return an array of formatted user objects if users exist", async () => {
        prismaMock.user.findMany.mockResolvedValueOnce([mockedUserOutput, mockedUserOutput]);
        prismaMock.user.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

        const result = await getAllUsers();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(expect.arrayContaining([mockedFormattedUserOutput, mockedFormattedUserOutput]));
    });
});

describe("mapToUserDTO function", () => {
    it("should format a user object correctly", async () => {
        prismaMock.user.count.mockResolvedValueOnce(0);

        const formattedUser = await mapToUserDTO(mockedUserOutput, true);

        expect(formattedUser).toEqual(mockedFormattedUserOutput);
    });
});