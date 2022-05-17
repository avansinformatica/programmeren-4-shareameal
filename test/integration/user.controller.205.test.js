process.env.DB_DATABASE = process.env.DB_DATABASE || "prog4";
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

// UC-205 = Update a single user
describe("UC-205 * Change user /api/user/:userId", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(CLEAR_DB, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) next(err);
        // done() aanroepen nu je de query callback eindigt.
        logger.debug("beforeEach done");
        done();
      });
    });
  });

  //DONE FINAL
  it.only("UC-205-1 A required field is missing, return 400 response", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .send({
        lastName: "Bull",
        street: "Straatje",
        city: "Zandvoort",
        isActive: true,
        emailAdress: "red@bull.nl",
        password: "RedBull=123",
        phoneNumber: "0698876554",
      })
      .end((err, res) => {
        logger.debug(res.status);
        res.should.be.an("object");
        let { status, result } = res.body;
        logger.debug("res.body: ");
        logger.debug(res.body);
        logger.debug("res.statusCode: ");
        logger.debug(res.statusCode);
        logger.debug("res.result: ");
        logger.debug(res.body.err.result);
        res.statusCode.should.eql(400);
        res.body.err.result.should.be
          .a("string")
          .that.equals("First Name must be a string");
        done();
      });
  });

  //TODO
  it("UC-205-3 Invalid phone number, return 400 response", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        //
        firstName: "Anika",
        lastName: "Wante",
        street: "Academiesingel 17",
        city: "Breda",
        isActive: true,
        emailAdress: "test@student.avans.nl",
        password: "password",
        phoneNumber: "0612345678",
      })
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(400);
        result.should.be.a("string").that.equals("Password is invalid");
        done();
      });
  });

  // DONE
  it("UC-205-4 User doesn't exist, return 400 response", (done) => {
    chai
      .request(server)
      .put("/api/user/3")
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(400);
        result.should.be.a("string").that.equals("User with ID 3 not found");
        done();
      });
  });

  //TODO
  it("UC-205-5 Not logged in, return 401 response", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        //
        firstName: "Anika",
        lastName: "Wante",
        street: "Academiesingel 17",
        city: "Breda",
        isActive: true,
        emailAdress: "test@student.avans.nl",
        password: "P@ssw0rd123",
        phoneNumber: "0612345678",
      })
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(400);
        result.should.be.a("string").that.equals("User already exists");
        done();
      });
  });

  // DONE
  it("UC-205-6 User is successfully changed, return 200 response", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .send({
        id: 1,
        firstName: "Green",
        lastName: "Bull",
        street: "Straatje",
        city: "Zandvoort",
        isActive: true,
        emailAdress: "red@bull.nl",
        password: "RedBull=123",
        phoneNumber: "0698876554",
      })
      .end((err, res) => {
        let { status, result } = res.body;
        res.should.have.status(200);
        result.should.be.a("array").that.eql([
          {
            id: 1,
            firstName: "Green",
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
        ]);
        done();
      });
  });
});
