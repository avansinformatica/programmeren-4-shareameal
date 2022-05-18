const dbconnection = require("../database/dbconnection");
const logger = require("../config/config").logger;
const assert = require("assert");

let id = 0;

module.exports = {
  //addUser UC-201
  addUser: (req, res) => {
    logger.debug("addUser aangeroepen");
    //TODO check if user exists

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      id++;

      let user = req.body;

      // Use the connection
      connection.query(
        "INSERT INTO user(firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user.firstName,
          user.lastName,
          user.street,
          user.city,
          user.isActive,
          user.emailAdress,
          user.password,
          user.phoneNumber,
        ],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) {
            connection.release();
            res.status(409).json({
              status: 409,
              message: `User already exists`,
            });
          } else {
            // Get new user and send back as result
            connection.query(
              `SELECT * FROM user WHERE emailAdress = ?;`,
              [user.emailAdress],
              function (error, results, fields) {
                connection.release();

                let resultUser = results[0];

                logger.debug("#results = ", results.length);
                res.status(201).json({
                  statusCode: 201,
                  results: resultUser,
                });
              }
            );
          }
        }
      );
    });
  },

  //getAllUsers UC-202
  getAllUsers: (req, res, next) => {
    //valideer als goede data is bij post
    logger.debug("getAllUsers aangeroepen");

    const queryParams = req.query;
    logger.debug(queryParams);

    // TODO welke 2 dit worden wordt bepaald
    let { name, isActive } = req.query;
    let queryString = "SELECT `id`, `name` FROM `meal`";
    if (name || isActive) {
      queryString += " WHERE ";
      if (name) {
        queryString += "`name` LIKE ?";
        name = "%" + name + "%";
      }
      if (name && isActive) queryString += " AND ";
      if (isActive) {
        queryString += "`isActive` = ?";
      }
    }
    queryString += ";";
    logger.debug(`queryString = ${queryString}`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        queryString,
        [name, isActive],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(error);

          // Don't use the connection here, it has been returned to the pool.
          logger.debug("#results = ", results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
        }
      );
    });
  },

  //UC-203?? -- "/api/user/profile" nog niet gerealiseerd (zie routes)

  //validateUser
  validateUser: (req, res, next) => {
    const {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      password,
      phoneNumber,
    } = req.body;
    try {
      assert(typeof firstName === "string", "First Name must be a string");
      assert(typeof lastName === "string", "Last Name must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(typeof isActive === "boolean", "Is Active must be a boolean");
      assert(typeof emailAdress === "string", "Email Address must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof phoneNumber === "string", "phoneNumber must be a string");

      let isUnique;

      function validateEmail(email) {
        var re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
      }

      if (!validateEmail(req.body.emailAdress)) {
        return res.status(400).json({
          status: 400,
          message: "Email Address must contain an @ symbol and a dot",
        });
      }
      function validatePassword(password) {
        var re =
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i;
        return re.test(password);
      }

      if (!validatePassword(req.body.password)) {
        return res.status(400).json({
          status: 400,
          message:
            "Password should have at least eight characters, at least one letter, one number and one special character.",
        });
      }

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

  //getUserById UC-204
  getUserById: (req, res, next) => {
    logger.debug("getUserById aangeroepen");

    const userId = req.params.userId;
    logger.debug(`User met ID ${userId} gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        "SELECT * FROM `user` WHERE `id` = ?",
        [userId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(error);

          // Don't use the connection here, it has been returned to the pool.
          logger.debug("#results = ", results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
        }
      );
    });
  },

  //updateSingleUser UC-205
  updateSingleUser: (req, res, next) => {
    //TODO validate on correctness data, alle velden behalve id? neem je sws al niet mee

    let user = req.body;

    logger.debug("updateSingleUser aangeroepen");

    const userId = req.params.userId;
    logger.debug(`User met ID ${userId} gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err);

      // Use the connection
      connection.query(
        "UPDATE `user` SET `firstName` = ?, `lastName` = ?, `street` = ?, `city` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ? WHERE `id` = ?;",
        [
          user.firstName,
          user.lastName,
          user.street,
          user.city,
          user.isActive,
          user.emailAdress,
          user.password,
          user.phoneNumber,
        ],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(error);

          // Don't use the connection here, it has been returned to the pool.
          logger.debug("#results = ", results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
        }
      );
    });
  },

  //deleteSingleUser UC-206
  deleteSingleUser: (req, res, next) => {
    const userId = req.params.userId;
    logger.debug(`User met ID ${userId} wordt gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        "DELETE FROM `user` WHERE `id` = ?",
        [userId],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(error);

          // Don't use the connection here, it has been returned to the pool.
          logger.debug("#results = ", results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
        }
      );
    });
  },
};
