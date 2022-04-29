const assert = require("assert");
// const database = require("../../database/inmemdb")

const dbconnection = require("../../database/dbconnection");

let database = [];
let id = 0;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;
    try {
      assert(typeof firstName === "string", "First Name must be a string");
      assert(typeof lastName === "string", "Last Name must be a string");

      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },
  addUser: (req, res) => {
    let user = req.body;
    id++;
    user = {
      id,
      ...user,
    };
    console.log(user);
    database.push(user);
    res.status(201).json({
      status: 201,
      result: database,
    });
  },
  getAllUsers: (req, res) => {
    // res.status(200).json({
    //   status: 200,
    //   result: database,
    // });
    //valideer als goede data is bij post
    console.log("getAllUsers aangeroepen");
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT id, name FROM meal;",
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          res.status(200).json({
            statusCode: 200,
            results: results,
          });
          console.log("result = ", results);
        }
      );
    });
  },
  getUserById: (req, res, next) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      const error = {
        status: 404,
        result: `User with ID ${userId} not found`,
      };
      next(error);
    }
  },
};

module.exports = controller;
