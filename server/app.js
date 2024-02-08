/*
 * Imports
 */
require('dotenv').config()
const port = process.env.PORT || 3000;
const path = require("path");
const fs = require('fs');
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const { requestLoggerMiddleware: { logRequests } } = require("./src/middleware");
const { dateFormatter } = require("./src/utils");
const winston = require('winston');
const express = require("express");
const app = express();

/*
 * Logger setup.
 * Configures logging: Morgan for development HTTP logs, and Winston for structured file logging in other environments.
 * Log files are named with the current date in 'log/general' and 'log/error'. Ensures log directories exist.
 */
if(process.env.NODE_ENV === "development"){
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Creates directories
const generalLogDir = path.join(__dirname, 'log/general');
const errorLogDir = path.join(__dirname, 'log/error');
if (!fs.existsSync(generalLogDir)) fs.mkdirSync(generalLogDir, { recursive: true });
if (!fs.existsSync(errorLogDir)) fs.mkdirSync(errorLogDir, { recursive: true });

// Configures loggers
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(errorLogDir, `${dateFormatter.getCurrentDateSimple()}error.log`),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(generalLogDir, `${dateFormatter.getCurrentDateSimple()}general.log`)
    })
  ]
});
global.logger = logger;
const errorFactory = require("./src/utils/errorFactory.js");
app.use(logRequests); // Logs HTTP requests

/*
 * Uncaught error handler
 */
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  try {
    var { stack, message, ...errorDetails } = error;
  } catch (error) {
    var stack = null, message = null, errorDetails = null;
  }
  errorFactory(500, `Uncaught exception: ${message}`, error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  errorFactory(500, "Unhandled promise rejection", reason);
});

/*
* Rate-Limiter setup
*/
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,  // Rate limit window
  limit: process.env.RATE_LIMIT,                        // Limit each IP to an amount of requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false
})
app.use(limiter);

/*
 * Cors setup
 */
const corsOptions = {
  origin: [
    ""
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Pre-flight request

/*
 * App setup
 */
const indexRouter = require("./routes/index");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);

/**
 * App start
 */
app.listen(port, () => {
  console.log(
    `${process.env.SERVER_NAME} - Server started: Listening at {all interfaces}:${port}`
  );
});
