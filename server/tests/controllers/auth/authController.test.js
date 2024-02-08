/**
 * Mocks
 */
process.env.JWT_SECRET = "mockedSecret"
const mockedUserInput = {
    email: "test@jest.co",
    name: "TestJoe",
    password: "password123",
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
}
const mockedHashedPassword = "hashedPassword";
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue("mockedToken")
}));

/**
 * Imports
 */
const { register, signin } = require('../../../src/controllers/auth/authController.js');
const { prismaMock } = require('../../singleton.ts');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Testing register function
 */
describe("register function", () => {
    it("should return an error Result if email format is invalid", async () => {
        const result = await register('bad', mockedUserInput.name, mockedUserInput.password);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Invalid email format.");
    });

    it("should return an error Result if name is less than 4 characters", async () => {
        const result = await register(mockedUserInput.email, 'bad', mockedUserInput.password);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Name must be at least 4 characters long.");
    });

    it("should return an error Result if password is less than 8 characters", async () => {
        const result = await register(mockedUserInput.email, mockedUserInput.name, 'bad');

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Password must be at least 8 characters long.");
    });

    it("should successfully register a user and return a token within a success Result", async () => {
        prismaMock.user.create.mockResolvedValueOnce(mockedUserOutput);

        const result = await register(mockedUserInput.email, mockedUserInput.name, mockedUserInput.password);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockedUserInput.password, expect.any(Number));
        expect(jwt.sign).toHaveBeenCalled();
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toHaveProperty('token');
    });
});

/**
 * Testing signin function
 */
describe("signin function", () => {
    it("should return an error Result if user is not found", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(null);

        const result = await signin("bad", mockedUserInput.password);

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Wrong combination of email and password, or user does not exist.");
    });

    it("should return an error Result if password is incorrect", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedUserOutput);
        bcrypt.compare.mockResolvedValue(false);

        const result = await signin(mockedUserInput.email, "bad");

        expect(result.isError()).toBe(true);
        expect(result.error[0].message).toBe("Wrong combination of email and password, or user does not exist.");
    });

    it("should successfully sign in a user and return a token within a success Result", async () => {
        bcrypt.compare.mockResolvedValue(true);
        prismaMock.user.findUnique.mockResolvedValueOnce(mockedUserOutput);

        const result = await signin(mockedUserInput.email, mockedUserInput.password);

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toHaveProperty('token');
        expect(bcrypt.compare).toHaveBeenCalledWith(mockedUserInput.password, mockedUserOutput.hashedPassword);
        expect(jwt.sign).toHaveBeenCalled();
    });
});


