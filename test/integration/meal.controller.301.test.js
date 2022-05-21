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

// UC-301 addMeal
describe("UC-301 add meal", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected

      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          connection.release();
          if (error) next(err);
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

  it("TC-301-1 Verplicht veld ontbreekt, return 400", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .send({
        //name ontbreekt
        description: "Dé pastaklassieker bij uitstek.",
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "2022-05-20T08:30:53.232Z",
        imageUrl:
          "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        maxAmountOfParticipants: 6,
        price: 6.75,
      })
      .end((err, res) => {
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(400);
        res.body.results.should.be
          .a("string")
          .that.equals("Name of meal must be a string");
        done();
      });
  });

  it("TC-301-2 Not logged in, return 401 response", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("authorization", "Bearer " + "1234567890")
      .send({
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "2022-05-20T08:30:53.232Z",
        imageUrl:
          "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        maxAmountOfParticipants: 6,
        price: 6.75,
      })
      .end((err, res) => {
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(401);
        res.body.error.should.be.a("string").that.equals("Not authorized");
        done();
      });
  });

  it("TC-301-3 Meal successfully added, return 200", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .send({
        name: "Spaghetti Bolognese",
        description: "Dé pastaklassieker bij uitstek.",
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: "2023-05-20T08:30:53.232Z",
        imageUrl:
          "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        maxAmountOfParticipants: 6,
        price: 6.75,
      })
      .end((err, res) => {
        logger.info(res.body);
        res.should.be.an("object");
        let { status, result } = res.body;
        res.should.have.status(201);
        var firstItem = res.body.results[0];
        res.body.results.should.have
          .property("id")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results.should.have
          .property("isActive")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results.should.have
          .property("isVega")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results.should.have
          .property("isVegan")
          .and.to.be.a("number")
          .that.equals(0);
        res.body.results.should.have
          .property("isToTakeHome")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results.should.have
          .property("maxAmountOfParticipants")
          .and.to.be.a("number")
          .that.equals(6);
        res.body.results.should.have
          .property("price")
          .and.to.be.a("string")
          .that.equals("6.75");
        res.body.results.should.have
          .property("imageUrl")
          .and.to.be.a("string")
          .that.equals(
            "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg"
          );
        res.body.results.should.have
          .property("cookId")
          .and.to.be.a("number")
          .that.equals(1);
        res.body.results.should.have
          .property("name")
          .and.to.be.a("string")
          .that.equals("Spaghetti Bolognese");
        res.body.results.should.have
          .property("description")
          .and.to.be.a("string")
          .that.equals("Dé pastaklassieker bij uitstek.");
        done();
      });
  });
});
