// const mysql = require("mysql");
// require("dotenv").config();

// const pool = mysql.createPool({
//   connectionLimit: 10,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// // pool.getConnection(function (err, connection) {
// //   if (err) next (err); // not connected!

// //   // Use the connection
// //   connection.query(
// //     "SELECT id, name FROM meal;",
// //     function (error, results, fields) {
// //       // When done with the connection, release it.
// //       connection.release();

// //       // Handle error after the release.
// //       if (error) next (err);

// //       // Don't use the connection here, it has been returned to the pool.
// //       logger.debug("result = ", results);

// //       pool.end((err) => {
// //         logger.debug("pool was closed.");
// //       });
// //     }
// //   );
// // });

// pool.on("acquire", function (connection) {
//   logger.debug("Connection %d acquired", connection.threadId);
// });

// pool.on("release", function (connection) {
//   logger.debug("Connection %d released", connection.threadId);
// });

// module.exports = pool;

// const mysql = require("mysql2");
// const connection = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "",
//   database: "share-a-meal",
// });

// connection.connect();

// connection.query("SELECT * FROM meal", function (error, results, fields) {
//   if (error) throw error;
//   console.log("The solution is: ", restults);
// });

// connection.end();

//TODO WORKING
// // get the client
// const mysql = require("mysql2");

// // create the connection to database
// const connection = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "",
//   database: "share-a-meal",
// });

// // simple query
// connection.query(
//   "SELECT `name`, `id` FROM `meal`",
//   function (err, results, fields) {
//     console.log(`The solution is: `, results[0].name); // results contains rows returned by server
//   }
// );

// connection.end();

process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";
process.env.LOGLEVEL = "warn";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../src/database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/config/config");

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe("Movies API", () => {
  //
  // informatie over before, after, beforeEach, afterEach:
  // https://mochajs.org/#hooks
  //
  before((done) => {
    logger.debug(
      "before: hier zorg je eventueel dat de precondities correct zijn"
    );
    logger.debug("before done");
    done();
  });

  describe("UC201 Create movie", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query(
          CLEAR_DB + INSERT_USER,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });

    it.skip("TC-201-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .post("/api/movie")
        .send({
          // name is missing
          year: 1234,
          studio: "pixar",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");

          res.body.should.be
            .an("object")
            .that.has.all.keys("statusCode", "message");
          statusCode.should.be.an("number");
          message.should.be.a("string").that.contains("error");
          done();
        });
    });

    it("TC-201-2 should return a valid error when postal code is invalid", (done) => {
      // Zelf verder aanvullen
      done();
    });

    // En hier komen meer testcases
  });

  describe("UC-303 Lijst van maaltijden opvragen /api/meal", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEALS,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();
            // Handle error after the release.
            if (error) throw error;
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });

    it("TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd", (done) => {
      chai
        .request(server)
        .get("/api/movie")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an("object");

          res.body.should.be
            .an("object")
            .that.has.all.keys("results", "statusCode");

          const { statusCode, results } = res.body;
          statusCode.should.be.an("number");
          results.should.be.an("array").that.has.length(2);
          results[0].name.should.equal("Meal A");
          results[0].id.should.equal(1);
          done();
        });
    });
    // En hier komen meer testcases
  });
});

//
var token;

beforeEach((done) => {
  logger.debug("beforeEach called");
  // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
  dbconnection.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    connection.query(CLEAR_DB, function (error, result, field) {
      if (error) throw error;
      connection.query(
        INSERT_USER + INSERT_SECONDUSER,
        function (error, result, field) {
          if (error) throw error;
          connection.release();
          done();
        }
      );
    });
  });

  chai
    .request(server)
    .post("/api/auth/login")
    .send({ emailAdress: "name@server.nl", password: "secret" })
    .end((err, res) => {
      logger.info(res.body);
      if (res.body.results.token) {
        //?
        token = res.body.results.token;
      }
      logger.info(token);
    });
});

it("UC-202-2 Toon twee gebruikers", (done) => {
  chai
    .request(server)
    .get("/api/user")
    .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
    .end((err, res) => {
      logger.info("res.body = " + res.body);
      logger.info(res.body);
      res.should.be.an("object");
      let { status, result } = res.body;
      res.should.have.status(200);
      res.body.results.should.be.a("array");
      res.body.results.length.should.be.eql(2);
      done();
    });
});
