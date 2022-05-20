const express = require("express");
const authRoutes = require("./src/routes/authentication.routes");
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");
const mealRouter = require("./src/routes/meal.routes");
const logger = require("./src/config/config").logger;
const dbconnection = require("./src/database/dbconnection");
const res = require("express/lib/response");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`);
  next();
});

app.use(userRouter);
app.use(mealRouter);
app.use(authRoutes);

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.debug("Error handler called.");
  res.status(err.status).json({
    err,
  });
});

app.listen(port, () => {
  logger.debug(`Example app listening on port ${port}`);
});

process.on("SIGINT", () => {
  logger.debug("SIGINT signal received: closing HTTP server");
  dbconnection.end((err) => {
    logger.debug("Database connection closed");
  });
  app.close(() => {
    logger.debug("HTTP server closed");
  });
});

module.exports = app;
