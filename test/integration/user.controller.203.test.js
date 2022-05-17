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

// UC-203 = Request personal user profile
describe("UC-203 * Request userprofile /api/user/??profile or :userId", () => {
  beforeEach((done) => {
    database = [];
    done();
  });

  // //TODO (nog niet voor inlevermoment 2 want endpoint nog niet gerealiseerd)
  it("UC-203-1 Invalid token, return 404 response", (done) => {
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
        res.should.be.an("object");
        let { status, result } = res.body;
        status.should.equals(200);
        result.should.be.a("string").that.equals("First Name must be a string");
        done();
      });
  });

  // //TODO (nog niet voor inlevermoment 2 want endpoint nog niet gerealiseerd)
  it("UC-203-2 Valid token and user exists, return 200 response", (done) => {
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
});
