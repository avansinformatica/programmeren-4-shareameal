process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";
process.env.LOGLEVEL = "debug"; //warn

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

//Login authentication
describe("Manage login", () => {
  describe("UC-101 login", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        logger.debug("In get connection");
        logger.debug("ERR=");
        logger.debug(err);
        if (err) throw err; // not connected!
        logger.debug("after err next");

        // Use the connection
        connection.query(
          CLEAR_DB,
          INSERT_USER,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) next(err);
            // done() aanroepen nu je de query callback eindigt.
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });

    //it.only when you only want to run this test
    //it.skip if you only want to skip this test

    // DONE
    it.only("UC-101-5 User succesfully logged in, return 200 status", (done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
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
  });
});
