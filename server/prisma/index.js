const wrappedPrisma = require("./prismaClient.js");
const prisma = wrappedPrisma.default || wrappedPrisma;
module.exports = prisma;