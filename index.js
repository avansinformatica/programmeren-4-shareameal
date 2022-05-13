const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");
const res = require("express/lib/response");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`);
  next();
});

app.use(userRouter); //app.use("/api", userRoutes);
//app.use(mealRouter); //app.use("/api", mealRoutes);

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json(err);
});

app.listen(port, () => {
  logger.debug(`Example app listening on port ${port}`);
});

module.exports = app;
