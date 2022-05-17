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

//UC-206 = Delete a user
describe("UC-206 ** Delete user /api/user/:userId", () => {
  beforeEach((done) => {
    database = [];
    done();
  });

  // DONE
  it("UC-206-1 User doesn't exist, return 400 response", (done) => {
    chai
      .request(server)
      .delete("/api/user/3")
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(404);
        result.should.be.a("string").that.equals("User with ID 3 not found");
        done();
      });
  });

  //TODO (niet voor inlevermoment 2)
  it("UC-206-2 Not logged in, return 401 response", (done) => {
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
        status.should.equals(400);
        result.should.be
          .a("string")
          .that.equals("Email Address must contain an @ symbol and a dot");
        done();
      });
  });

  //TODO (niet voor inlevermoment 2)
  it("UC-206-3 Actor is no owner, return 403 response", (done) => {
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
  it("UC-206-4 User successfully deleted, return 200 response", (done) => {
    chai
      .request(server)
      .delete("/api/user/2")
      .end((err, res) => {
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(200);
        result.should.be.a("array").that.eql([
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
        ]);
        done();
      });
  });
});
