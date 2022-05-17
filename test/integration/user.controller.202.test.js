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
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-202 = Get all users
describe("UC-202 Overview users /api/user", () => {
  beforeEach((done) => {
    database = [];
    done();
  });

  // DONE
  it("UC-202-1 Give 0 users, return 200 response", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(200);
        result.should.be.a("array");
        result.length.should.be.eql(0);
        done();
      });
  });

  //TODO ?? only one user?
  it("UC-202-2 Give 2 users, return 200 response", (done) => {
    let user = new User({
      firstName: "Pietje",
      lastName: "Precies",
      street: "Straatnaam 3",
      city: "Breda",
      isActive: true,
      emailAdress: "pietje@precies.nl",
      password: "PietjesPassword123",
      phoneNumber: "0612233445",
    });
    user.save((err, user) => {
      chai
        .request(server)
        .get("/api/user")
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

  //TODO
  it("UC-202-3 Give users with non existing name, return 200 response", (done) => {
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
  it("UC-202-4 Give users for 'isActive' = false, return 200 response", (done) => {
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
  it("UC-202-5 Give users for 'isActive' = true, return 200 response", (done) => {
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
  it("UC-202-6 Give users with existing name, return 200 response", (done) => {
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
        status.should.equals(200);
        //              result.should.be
        //                .a("string")
        //                .that.equals("User is successfully registered");
        done();
      });
  });
});
