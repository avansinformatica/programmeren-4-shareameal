process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal";
process.env.LOGLEVEL = "warn"; //debug

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../src/database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/config/config");
const { getSystemErrorMap } = require("util");

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

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-201 = add users
describe("UC-201 add users /api/user", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

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

  // DONE
  it("TC-201-1 Verplicht veld ontbreekt", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        //first name ontbreekt
        lastName: "Wante",
        emailAdress: "wante@student.avans.nl",
        password: "P@ssw0rd123",
      })
      .end((err, res) => {
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(400);
        res.body.results.should.be
          .a("string")
          .that.equals("First Name must be a string");
        done();
      });
  });

  it("TC-201-2 Niet-valide email adres", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        //fout email address
        firstName: "Anika",
        lastName: "Wante",
        street: "Academiesingel 17",
        city: "Breda",
        isActive: true,
        emailAdress: "wantestudent.avans.nl",
        password: "P@ssw0rd123",
        phoneNumber: "0612345678",
      })
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(400);
        res.body.message.should.be
          .a("string")
          .that.equals("Email Address must contain an @ symbol and a dot");
        done();
      });
  });

  it("TC-201-3 Niet-valide wachtwoord", (done) => {
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
        logger.info("res.body = ");
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(400);
        res.body.message.should.be
          .a("string")
          .that.equals(
            "Password should have at least eight characters, at least one letter, one number and one special character."
          );
        done();
      });
  });

  it("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
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
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(201);
        done();
      });
  });

  describe("TC 201-4 Insert existing user", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) next(err); // not connected!

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
    });

    it("TC-201-4 Gebruiker bestaat al", (done) => {
      logger.debug("in 201-4");

      chai
        .request(server)
        .post("/api/user")
        .send({
          //
          firstName: "first",
          lastName: "last",
          street: "street",
          city: "city",
          isActive: true,
          emailAdress: "name@server.nl",
          password: "Password123$",
          phoneNumber: "0612345678",
        })
        .end((err, res) => {
          logger.debug("res.body");
          logger.debug(res.body);
          res.should.be.an("object");
          let { status, result } = res.body;
          res.should.have.status(409);
          res.body.message.should.be
            .a("string")
            .that.equals("User already exists");
          done();
        });
    });
  });
});
