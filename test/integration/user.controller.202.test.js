process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal";
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
  '(1, "first", "last", "name@server.nl", "Password123$", "street", "city");';

const INSERT_TWOUSERS =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "name@server.nl", "Password123$", "street", "city");' +
  '(2, "second", "last", "namesecond@server.nl", "Passwordsecond123$", "street", "city");';

const INSERT_THREEUSERS =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "name@server.nl", "Password123$", "street", "city");' +
  '(2, "second", "last", "namesecond@server.nl", "Passwordsecond123$", "street", "city");' +
  '(3, "third", "last", "namethirdd@server.nl", "Passwordthird123$", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-202 = Get all users
describe("UC-202-1 Overzicht van gebruikers, return 0 users", () => {
  var token;

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
      .send({ emailAdress: "name@server.nl", password: "Password123$" })
      .end((err, res) => {
        logger.info(res.body);
        if (token) {
          token = res.body.results.token;
        }
        logger.info(token);
      });
  });

  // beforeEach((done) => {
  //   logger.debug("beforeEach called");
  //   // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
  //   dbconnection.getConnection(function (err, connection) {
  //     if (err) next(err); // not connected!

  //     // Use the connection
  //     connection.query(
  //       CLEAR_DB + INSERT_USER,
  //       function (error, results, fields) {
  //         // When done with the connection, release it.
  //         connection.release();

  //         // Handle error after the release.
  //         if (error) next(err);
  //         // done() aanroepen nu je de query callback eindigt.
  //         logger.debug("beforeEach done");
  //         done();
  //       }
  //     );
  //   });
  // });

  // DONE
  it("UC-202-1 Toon nul gebruikers", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        logger.debug(res.body);
        status.should.equals(200);
        result.should.be.a("array");
        result.length.should.be.eql(0);
        done();
      });
  });
});

describe("UC-202-2 Overzicht van gebruikers, return 2 users", () => {
  var token;

  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_THREEUSERS,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw err;
          // done() aanroepen nu je de query callback eindigt.
          logger.debug("beforeEach done");
          done();
        }
      );
    });

    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "name@server.nl", password: "Password123$" })
      .end((err, res) => {
        logger.info(res.body);
        if (res.body.results.token) {
          token = res.body.results.token;
        }
        logger.info(token);
        done();
      });
  });

  it.only("UC-202-2 Toon twee gebruikers", (done) => {
    logger.debug("In 202-2");
    chai
      .request(server)
      .get("/api/user")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(200);
        result.should.be.a("array");
        result.length.should.be.eql(2);
        done();
      });
  });
});

describe("UC-202-3/6 Overzicht van gebruikers, return 1 user", () => {
  var token;

  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_TWOUSERS,
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
      .send({ emailAdress: "name@server.nl", password: "Password123$" })
      .end((err, res) => {
        logger.info(res.body);
        if (token) {
          token = res.body.results.token;
        }
        logger.info(token);
      });
  });

  // beforeEach((done) => {
  //   logger.debug("beforeEach called");
  //   // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
  //   dbconnection.getConnection(function (err, connection) {
  //     if (err) next(err); // not connected!

  //     // Use the connection
  //     connection.query(
  //       CLEAR_DB + INSERT_USER,
  //       function (error, results, fields) {
  //         // When done with the connection, release it.
  //         connection.release();

  //         // Handle error after the release.
  //         if (error) next(err);
  //         // done() aanroepen nu je de query callback eindigt.
  //         logger.debug("beforeEach done");
  //         done();
  //       }
  //     );
  //   });
  // });

  //TODO
  it("UC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam", (done) => {
    chai
      .request(server)
      .get("/api/user")
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

  //TODO
  it("UC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld 'isActive'=false", (done) => {
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

  //TODO
  it("UC-202-5 Toon gebruikers met gebruike van de zoekterm op het veld 'isActive'=true", (done) => {
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

  //TODO
  it("UC-202-6 Toon gebruikers met zoekterm op bestaande naam", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .set("Authorization", "Bearer " + token)
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
        status.should.equals(200);
        //              result.should.be
        //                .a("string")
        //                .that.equals("User is successfully registered");
        done();
      });
  });
});
