const dbconnection = require("../../database/dbconnection");
const logger = require("");
const assert = require("assert");

let database = [
  {
    id: 1,
    firstName: "Red",
    lastName: "Bull",
    street: "Straatje",
    city: "Zandvoort",
    isActive: true,
    emailAdress: "red@bull.nl",
    password: "RedBull=123",
    phoneNumber: "0698876554",
  },
  {
    id: 2,
    firstName: "Pietje",
    lastName: "Precies",
    street: "Laan",
    city: "Amsterdam",
    isActive: true,
    emailAdress: "pietje@precies.nl",
    password: "PietjePrecies=123",
    phoneNumber: "0612345678",
  },
];
let id = 0;

module.exports = {
  //addUser UC-201
  addUser: (req, res) => {
    //TODO check if user exists
    const userId = req.params.userId;
    logger.debug(`User met ID ${userId} gezocht`);
    let user = database.findIndex((item) => item.id == userId);
    if (user >= 0) {
      id++;
      user = {
        id,
        ...user,
      };
      database.push(user);
      res.status(201).json({
        status: 201,
        result: database,
      });
    } else {
      res.status(400).json({
        status: 400,
        result: "User already exists",
      });
    }
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
      if (err) throw err; // not connected!

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

      //als in database al een zelfde emailAddress staat -> error
      //emailadress moet '@' teken bevatten en '.' teken bevatten
      function validateEmail(email) {
        // var re = /\S+@\S+\.\S+/;
        // return re.test(email);
        return true;
      }

      assert(
        validateEmail(emailAdress),
        "Email Address must contain an @ symbol and a dot"
      );

      //password is correct
      assert(password != "password", "Password is invalid");

      next();
    } catch (err) {
      logger.debug(`Error message: ${err.message}`);
      logger.debug(`Error code: ${err.code}`);

      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },

  //getUserById UC-204
  getUserById: (req, res, next) => {
    logger.debug("getUserById aangeroepen");

    const userId = req.params.userId;
    logger.debug(`User met ID ${userId} gezocht`);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

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
    //validate on correctness data, alle velden behalve id

    logger.debug("updateSingleUser aangeroepen");

    logger.debug(req.query);

    const userId = req.params.userId;
    //    logger.debug(`User met ID ${userId} wordt gezocht`);
    let user = database.findIndex((item) => item.id == userId);
    //    logger.debug(req.body)
    if (user >= 0) {
      database[user].firstName = req.body.firstName;
      database[user].lastName = req.body.lastName;
      database[user].street = req.body.street;
      database[user].city = req.body.city;
      database[user].isActive = req.body.isActive;
      database[user].emailAdress = req.body.emailAdress;
      database[user].password = req.body.password;
      database[user].phoneNumber = req.body.phoneNumber;

      res.status(200).json({
        status: 200,
        result: database,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },

  //deleteSingleUser UC-206
  deleteSingleUser: (req, res, next) => {
    const userId = req.params.userId;
    //    logger.debug(`User met ID ${userId} wordt gezocht om te verwijderen`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      //        logger.debug(database.findIndex(x => x.id == userId))
      let databaseT = database.splice(
        database.findIndex((x) => x.id == userId),
        1
      );

      res.status(200).json({
        status: 200,
        result: database,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${userId} not found`,
      });
    }
  },
};
