module.exports = {
    clearMocks: true,
    transform: {
        "\\.tsx?$": "ts-jest"
    },
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/singleton.ts', '<rootDir>/tests/setup.js']
};