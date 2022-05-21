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

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe("UC-204 * User details /api/user/:userId", () => {
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

  //implementation
  it("TC-304-1 Meal doesn't exist, return 404 response", (done) => {
    chai
      .request(server)
      .get("/api/meal/3")
      .set("authorization", "Bearer " + jwt.sign({ id: 3 }, jwtSecretKey))
      .end((err, res) => {
        let { status, result } = res.body;
        res.should.have.status(404);
        res.body.message.should.be
          .a("string")
          .that.equals("Meal with ID 3 not found");
        done();
      });
  });

  //implementation
  it("TC-304-2 Meal exists, return 200 response", (done) => {
    chai
      .request(server)
      .get("/api/meal/1")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        let { status, result } = res.body;
        res.should.have.status(200);
        res.body.results.should.be.a("array");
        res.body.results[0].should.have
          .property("id")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results[0].should.have
          .property("isActive")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results[0].should.have
          .property("isVega")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results[0].should.have
          .property("isVegan")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results[0].should.have
          .property("isToTakeHome")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results[0].should.have
          .property("maxAmountOfParticipants")
          .and.to.be.a("number")
          .that.equals(5);
        res.body.results[0].should.have
          .property("price")
          .and.to.be.a("string")
          .that.equals("6.50");
        res.body.results[0].should.have
          .property("imageUrl")
          .and.to.be.a("string")
          .that.equals("image url");
        res.body.results[0].should.have
          .property("cookId")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results[0].should.have
          .property("name")
          .and.to.be.a("string")
          .that.equals("Meal A");
        res.body.results[0].should.have
          .property("description")
          .and.to.be.a("string")
          .that.equals("description");
        done();
      });
  });
});
