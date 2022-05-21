process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal";
process.env.LOGLEVEL = "warn"; //warn

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

const INSERT_SECONDUSER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(2, "second", "last", "namesecond@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

//UC-305 = Delete a Meal
describe("UC-305-3", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER + INSERT_MEALS + INSERT_SECONDUSER,
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

    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "namesecond@server.nl", password: "secret" })
      .end((err, res) => {
        logger.info(res.body);
      });
  });

  it("TC-305-3 Actor is no owner, return 403 response", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1")
      .set("authorization", "Bearer " + jwt.sign({ id: 2 }, jwtSecretKey))
      .end((err, res) => {
        logger.info("res.body: ");
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(403);
        res.body.message.should.be
          .a("string")
          .that.equals(`You are no owner of meal with id = 1`);
        done();
      });
  });
});

describe("UC-305-2/4/5", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "name@server.nl", password: "secret" })
      .end((err, res) => {
        logger.info(res.body);
      });
  });

  it("TC-305-1 Not logged in, return 401 response", (done) => {
    chai
      .request(server)
      .delete("/api/meal/3")
      .set("authorization", "Bearer " + "thisisatoken")
      .end((err, res) => {
        logger.debug(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(401);
        res.body.error.should.be.a("string").that.equals("Not authorized");
        done();
      });
  });

  it("TC-305-4 Meal doesn't exist, return 404 response", (done) => {
    chai
      .request(server)
      .delete("/api/meal/3")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        logger.info("res.body: ");
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(400);
        res.body.results.should.be
          .a("string")
          .that.equals("Meal with ID 3 not found");
        done();
      });
  });

  it("TC-305-5 Meal successfully deleted, return 200 response", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        logger.info("res.body: ");
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(200);
        res.body.results.should.be
          .a("string")
          .that.eql("Meal with id 1 is successfully deleted");
        done();
      });
  });
});
