const dbconnection = require("../database/dbconnection");
const logger = require("../config/config").logger;
const assert = require("assert");
const { validateToken } = require("./authentication.controller");
const { getSystemErrorMap } = require("util");

let id = 0;

module.exports = {
  //validate meal
  validateMeal: (req, res, next) => {
    const {
      name,
      description,
      imageUrl,
      dateTime,
      maxAmountOfParticipants,
      price,
    } = req.body;
    try {
      assert(typeof name === "string", "Name of meal must be a string");
      assert(
        typeof description === "string",
        "description of meal must be a string"
      );
      assert(typeof dateTime === "string", "dateTime of meal must be a string");
      assert(typeof imageUrl === "string", "imageUrl of meal must be a string");
      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountOfParticipants of meal must be an number"
      );

      assert(typeof price === "number", "price of meal must be a number");
      next();
    } catch (err) {
      logger.debug(`Error message: ${err.message}`);
      logger.debug(`Error code: ${err.code}`);

      return res.status(400).json({
        status: 400,
        results: err.message,
      });
    }
  },

  // UC-301 Create meal
  addMeal: (req, res) => {
    logger.info("addMeal aangeroepen");
    let userId = req.userId;

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      id++;

      let meal = req.body;

      logger.debug("OOO CookId");
      logger.debug(userId);
      logger.debug("OOO req.userId");
      logger.debug(req.userId);

      connection.query(
        "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [
          id,
          meal.name,
          meal.description,
          meal.imageUrl,
          meal.dateTime,
          meal.maxAmountOfParticipants,
          meal.price,
          userId,
        ],
        function (error, results, fields) {
          connection.release();

          if (error) throw error;
          if (error) {
            res.status(409).json({
              status: 409,
              message: `Meal already exists`,
            });
          } else {
            // Get new Meal and send back as result
            connection.query(
              `SELECT * FROM meal WHERE cookId = ?;`,
              [userId],
              function (error, results, fields) {
                connection.release();

                let resultMeal = results[0];

                logger.debug("#results = ", results.length);
                res.status(201).json({
                  statusCode: 201,
                  results: resultMeal,
                });
              }
            );
          }
        }
      );
    });
  },

  // UC-302 Update meal (OPTIONEEL)

  // UC-303 Get all meals
  getAllMeals: (req, res) => {
    logger.info("getAllMeals aangeroepen");

    dbconnection.getConnection(function (err, connection) {
      dbconnection.getConnection(function (err, connection) {
        if (err) next(err); // not connected!

        connection.query(
          "SELECT * FROM meal",
          function (error, results, fields) {
            connection.release();

            if (error) next(error);

            logger.info("#results: ", results.length);

            res.status(201).json({
              statusCode: 201,
              results: results,
            });
          }
        );
      });
    });
  },

  // UC-304 Get single meal details
  getMealById: (req, res) => {
    logger.debug("getMealById aangeroepen");

    const mealId = req.params.mealId;
    logger.debug(`Meal met ID ${mealId} gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        "SELECT * FROM `meal` WHERE `id` = ?",
        [mealId],
        function (error, results, fields) {
          connection.release();

          if (error) next(error);

          if (results.length <= 0) {
            return res.status(404).json({
              status: 404,
              message: `Meal with ID ${mealId} not found`,
            });
          }

          logger.debug("#results = ", results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
        }
      );
    });
  },

  // UC-305 Delete a meal
  deleteSingleMeal: (req, res) => {
    logger.debug("delteSingleMeal aangeroepen");

    const mealId = req.params.mealId;
    logger.debug(`Meal met ID ${mealId} wordt gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        "SELECT * FROM meal WHERE id = ?",
        [mealId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(error);

          // Don't use the connection here, it has been returned to the pool.
          logger.debug("#results = ", results.length);
          logger.debug("#results = ", results);
          if (results.length > 0) {
            dbconnection.getConnection(function (err, connection) {
              if (err) next(err); // not connected!

              logger.debug("OOO mealId");
              logger.debug(mealId);
              logger.debug("OOO req.userId");
              logger.debug(req.userId);
              logger.debug("OOO results");
              logger.debug(results);
              logger.debug("OOO results[0].cookId");
              logger.debug(results[0].cookId);
              if (results[0].cookId != req.userId) {
                return res.status(403).json({
                  status: 403,
                  message: `You are no owner of meal with id = ${mealId}`,
                });
              }

              // Use the connection
              connection.query(
                "DELETE FROM meal WHERE id = ?",
                [mealId],
                function (error, results, fields) {
                  // When done with the connection, release it.
                  connection.release();

                  // Handle error after the release.
                  if (error) next(error);

                  // Don't use the connection here, it has been returned to the pool.
                  logger.debug("#results = ", results.length);
                  logger.debug("#results = ", results);
                  res.status(200).json({
                    statusCode: 200,
                    results: `Meal with id ${mealId} is successfully deleted`,
                  });
                }
              );
            });
          } else {
            res.status(400).json({
              statusCode: 400,
              results: `Meal with ID ${mealId} not found`,
            });
          }
        }
      );
    });
  },
};
