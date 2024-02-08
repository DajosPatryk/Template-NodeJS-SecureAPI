const express = require("express");
const router = express.Router();
const errorFactory = require("../src/utils/errorFactory.js");
const {authMiddleware: {authenticateToken}} = require("../src/middleware");
const {authController, userController, teamController, teamRequestController} = require("../src/controllers");

/*
* Swagger documentation
*/
if (process.env.NODE_ENV === "development") {   // Swagger runs only in development
    const swaggerUi = require("swagger-ui-express");
    const swaggerDocument = require("./swagger.json");
    router.use("/api/documentation", swaggerUi.serve);
    router.get("/api/documentation", swaggerUi.setup(swaggerDocument));
}

/* REGISTER */
router.post("/api/auth/register", async (req, res, next) => {
    try {
        // Retrieves data
        const { email = null, name = null, password = null } = req.body;

        // Runs
        const result = await authController.register(email, name, password);
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }
    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});

    }
});

/* SIGN-IN */
router.post("/api/auth/signin", async (req, res, next) => {
    try {
        // Retrieves data
        const { email = null, password = null } = req.body;

        // Runs
        const result = await authController.signin(email, password);
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
});

/* GET USER */
router.get("/api/user", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves queries
        const { email = null, name = null } = req.query;

        // Runs
        let result = {};
        if (email || name) {    // Determines if a query is provided
            result = await userController.getUser(email, name);
        } else {
            result = await userController.getAllUsers();
        }
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
});

/* GET TEAM */
router.get("/api/team", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves queries
        const {name = null} = req.query;

        // Runs
        let result = {};
        if (name) {    // Determines if a query is provided
            result = await teamController.getTeam(name);
        } else {
            result = await teamController.getAllTeams();
        }
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error.`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
})

/* POST TEAM */
router.post("/api/team", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { name = null, maxMemberCount = 11 } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamController.createTeam(email, name, maxMemberCount);
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});

    }
})

/* PUT TEAM */
router.put("/api/team", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null, updateData = null } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamController.updateTeam(teamName, email, updateData);
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});

    }
})

/* DELETE TEAM */
router.delete("/api/team", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamController.deleteTeam(teamName, email);
        if (result.isSuccess()) {
            res.status(200).json("Successfully deleted team.");
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
})

/* GET TEAM-REQUEST */
router.get("/api/team/request", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null } = req.query;
        const { email = null } = req.user;

        // Runs
        const result = await teamRequestController.getAllTeamRequests(email, teamName);
        if (result.isSuccess()) {
            res.status(200).json(result.value);
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
})

/* GET TEAM-REQUEST */
router.post("/api/team/request", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null, message = null } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamRequestController.createTeamRequest(email, teamName, message);
        if (result.isSuccess()) {
            res.status(200).json("Team request successfully created.");
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});

    }
})

/* PUT TEAM-REQUEST */
router.put("/api/team/request", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null, name = null } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamRequestController.acceptTeamRequest(email, teamName, name);
        if (result.isSuccess()) {
            res.status(200).json("Team request successfully accepted.");
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
})

/* DELETE TEAM-REQUEST */
router.delete("/api/team/request", authenticateToken, async (req, res, next) => {
    try {
        // Retrieves data
        const { teamName = null, name = null } = req.body;
        const { email = null } = req.user;

        // Runs
        const result = await teamRequestController.deleteTeamRequest(email, teamName, name);
        if (result.isSuccess()) {
            res.status(200).json("Team request successfully deleted.");
        } else {
            res.status(400).json(result.error);
        }

    } catch (error) {
        errorFactory(`Internal server error: ${error.message}`, 500, `Internal server error: ${error.message}`, 500, error, req);
        res.status(500).json({message: "Internal server error.", code: 500});
    }
})

module.exports = router;